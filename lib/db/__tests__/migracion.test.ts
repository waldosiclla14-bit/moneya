import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ESTADO_VACIO,
  agregarGasto,
  actualizarPresupuesto,
  estadoPresupuesto,
  totalGastos,
  totalesPorCategoria,
  type EstadoGastos,
} from '../../gastos/modelo';
import {
  IDS,
  aUnidadesMinimas,
  planificarMigracionGastos,
  type ContextoMigracion,
  type PasoSql,
} from '../migracion';
import { ESQUEMA_SQL } from '../esquema';

/**
 * Migra el estado de gastos de localStorage (lib/gastos/modelo.ts) al esquema
 * maestro. Todo se ejecuta en SQLite en memoria contra db/moneya_schema.sql.
 */

const CTX_CL: ContextoMigracion = { pais: 'CL', tz: '-03:00', ahora: '2026-10-20T12:00:00.000Z' };
const CTX_PE: ContextoMigracion = { pais: 'PE', tz: '-05:00', ahora: '2026-10-20T12:00:00.000Z' };

const leer = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

function crearBD(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(ESQUEMA_SQL);
  return db;
}

function aplicar(db: DatabaseSync, plan: PasoSql[]): void {
  db.exec('BEGIN');
  try {
    for (const paso of plan) db.prepare(paso.sql).run(...paso.params);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

const contar = (db: DatabaseSync, sql: string, ...params: (string | number)[]) =>
  (db.prepare(sql).get(...params) as { n: number }).n;

/** Gastos de CLP en pesos enteros: 1500 · 400 · 100 · 50 (alimentación/transporte/salud/ocio). */
function estadoDePrueba(): EstadoGastos {
  let estado: EstadoGastos = { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
  estado = agregarGasto(estado, { fecha: '2026-10-03', monto: 1500, categoriaId: 'alimentacion', nota: 'Feria' });
  estado = agregarGasto(estado, { fecha: '2026-10-05', monto: 400, categoriaId: 'transporte' });
  estado = agregarGasto(estado, { fecha: '2026-10-07', monto: 100, categoriaId: 'salud' });
  estado = agregarGasto(estado, { fecha: '2026-10-09', monto: 50, categoriaId: 'ocio', nota: 'Cine' });
  estado = actualizarPresupuesto(estado, 'alimentacion', 1000); // excedido: 1500/1000
  estado = actualizarPresupuesto(estado, 'transporte', 500); // cerca: 400/500 = 80 %
  estado = actualizarPresupuesto(estado, 'salud', 500); // ok: 100/500
  return estado;
}

describe('migración localStorage → esquema (lib/db/migracion.ts)', () => {
  it('migra ledger, perfil, cuenta, categorías, presupuestos y gastos (CL)', () => {
    const estado = estadoDePrueba();
    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_CL));

    expect(db.prepare('SELECT kind, country, currency FROM ledgers WHERE id = ?').get(IDS.ledger)).toEqual({
      kind: 'personal',
      country: 'CL',
      currency: 'CLP',
    });
    expect(
      db.prepare('SELECT country, locale, timezone, base_currency FROM app_profile WHERE id = 1').get(),
    ).toEqual({ country: 'CL', locale: 'es-CL', timezone: '-03:00', base_currency: 'CLP' });

    const cuenta = db
      .prepare('SELECT kind, include_in_safe_to_spend, opening_balance_minor FROM accounts WHERE id = ?')
      .get(IDS.cuenta) as { kind: string; include_in_safe_to_spend: number; opening_balance_minor: number };
    expect(cuenta).toEqual({ kind: 'cash', include_in_safe_to_spend: 0, opening_balance_minor: 0 });

    expect(contar(db, 'SELECT COUNT(*) AS n FROM categories WHERE ledger_id = ?', IDS.ledger)).toBe(
      estado.categorias.length,
    );
    expect(contar(db, 'SELECT COUNT(*) AS n FROM v_tx_effective')).toBe(estado.gastos.length);
    expect(contar(db, 'SELECT COUNT(*) AS n FROM budgets WHERE ledger_id = ?', IDS.ledger)).toBe(
      Object.keys(estado.presupuestos).length,
    );
    expect(contar(db, `SELECT COUNT(*) AS n FROM meta WHERE key = '${IDS.marcadorMigracion}'`)).toBe(1);
    db.close();
  });

  it('los totales por categoría coinciden con el modelo (CLP pesos enteros)', () => {
    const estado = estadoDePrueba();
    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_CL));

    const esperado = totalesPorCategoria(estado.gastos);
    const filas = db
      .prepare(
        `SELECT category_id, SUM(amount_minor) AS gastado FROM v_tx_effective
         WHERE ledger_id = ? GROUP BY category_id`,
      )
      .all(IDS.ledger) as { category_id: string; gastado: number }[];
    expect(filas).toHaveLength(Object.keys(esperado).length);
    for (const fila of filas) {
      expect(fila.gastado).toBe(aUnidadesMinimas(esperado[fila.category_id], 'CLP'));
    }
    db.close();
  });

  it('estados de presupuesto en paridad con estadoPresupuesto del modelo (excedido/cerca/ok)', () => {
    const estado = estadoDePrueba();
    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_CL));

    const totales = totalesPorCategoria(estado.gastos);
    const filas = db
      .prepare(
        `SELECT b.category_id, b.amount_minor, COALESCE(SUM(t.amount_minor), 0) AS gastado
         FROM budgets b LEFT JOIN v_tx_effective t
           ON t.category_id = b.category_id AND t.ledger_id = b.ledger_id
         WHERE b.ledger_id = ? GROUP BY b.category_id ORDER BY b.category_id`,
      )
      .all(IDS.ledger) as { category_id: string; amount_minor: number; gastado: number }[];
    expect(filas).toHaveLength(3);

    const estadosSql = filas.map((f) => ({
      id: f.category_id,
      sql: f.gastado >= f.amount_minor ? 'excedido' : f.gastado >= f.amount_minor * 0.8 ? 'cerca' : 'ok',
      modelo: estadoPresupuesto(totales[f.category_id], estado.presupuestos[f.category_id]),
    }));
    // ORDER BY category_id → alimentacion, salud, transporte
    expect(estadosSql.map((e) => e.sql)).toEqual(['excedido', 'ok', 'cerca']);
    expect([...estadosSql.map((e) => e.sql)].sort()).toEqual(['cerca', 'excedido', 'ok']);
    for (const e of estadosSql) expect(e.sql).toBe(e.modelo);
    db.close();
  });

  it('PEN usa 2 decimales (12,50 → 1250) y su presupuesto también', () => {
    let estado: EstadoGastos = { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
    estado = agregarGasto(estado, { fecha: '2026-10-05', monto: 12.5, categoriaId: 'alimentacion' });
    estado = agregarGasto(estado, { fecha: '2026-10-06', monto: 3.33, categoriaId: 'transporte', nota: 'Taxi' });
    estado = actualizarPresupuesto(estado, 'alimentacion', 100);

    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_PE));

    expect(db.prepare('SELECT currency FROM ledgers WHERE id = ?').get(IDS.ledger)).toEqual({ currency: 'PEN' });
    const montos = db
      .prepare('SELECT category_id, amount_minor FROM v_tx_effective ORDER BY amount_minor DESC')
      .all() as { category_id: string; amount_minor: number }[];
    expect(montos).toEqual([
      { category_id: 'alimentacion', amount_minor: 1250 },
      { category_id: 'transporte', amount_minor: 333 },
    ]);
    expect(
      db.prepare('SELECT amount_minor FROM budgets WHERE category_id = ?').get('alimentacion'),
    ).toEqual({ amount_minor: 10000 });
    db.close();
  });

  it('CLP sin subunidades redondea por gasto (12,4 → 12; 12,5 → 13) y documenta que 0,4 no se puede migrar', () => {
    expect(aUnidadesMinimas(12.4, 'CLP')).toBe(12);
    expect(aUnidadesMinimas(12.5, 'CLP')).toBe(13);

    let estado: EstadoGastos = { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
    estado = agregarGasto(estado, { fecha: '2026-10-04', monto: 12.4, categoriaId: 'otros' });
    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_CL));
    expect(db.prepare('SELECT amount_minor FROM v_tx_effective').get()).toEqual({ amount_minor: 12 });

    const chico: EstadoGastos = {
      ...ESTADO_VACIO,
      gastos: [{ id: 'g-chico', fecha: '2026-10-04', monto: 0.4, categoriaId: 'otros', nota: '' }],
    };
    expect(() => planificarMigracionGastos(chico, CTX_CL)).toThrow(/redondea a 0 unidades mínimas/);
    db.close();
  });

  it('conserva la fecha local: occurred_on = fecha y occurred_at es el mismo día', () => {
    const estado = estadoDePrueba();
    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_CL));
    const filas = db.prepare('SELECT occurred_on, occurred_at, occurred_tz FROM v_tx_effective').all() as {
      occurred_on: string;
      occurred_at: string;
      occurred_tz: string;
    }[];
    expect(filas).toHaveLength(4);
    for (const fila of filas) {
      expect(fila.occurred_at.startsWith(fila.occurred_on)).toBe(true);
      expect(fila.occurred_tz).toBe('-03:00');
    }
    db.close();
  });

  it('con solo gastos migrados no inventa saldo: Q1 devuelve todo en cero', () => {
    const estado = estadoDePrueba();
    const db = crearBD();
    aplicar(db, planificarMigracionGastos(estado, CTX_CL));

    // Limitación documentada: la cuenta migrada tiene apertura 0, así que su saldo
    // bruto es −(gastos migrados). Por eso está excluida de "libre hoy"
    // (include_in_safe_to_spend = 0): este módulo no modela ingresos ni saldos.
    expect(
      contar(
        db,
        'SELECT COALESCE(SUM(balance_minor), 0) AS n FROM v_account_balance WHERE ledger_id = ?',
        IDS.ledger,
      ),
    ).toBe(-aUnidadesMinimas(totalGastos(estado.gastos), 'CLP'));

    const consultas = leer('../../../db/consultas-muestra.sql')
      .split(/(?=^-- Q\d)/m)
      .filter((bloque) => /^-- Q\d/.test(bloque));
    expect(consultas[0].startsWith('-- Q1')).toBe(true);
    const q1 = consultas[0].replace(
      /:(ledger|from|to|today)\b/g,
      (_m, nombre: string) =>
        ({
          ledger: `'${IDS.ledger}'`,
          from: "'2026-10-01'",
          to: "'2026-10-31'",
          today: "'2026-10-20'",
        })[nombre] as string,
    );
    expect(db.prepare(q1).get()).toEqual({
      balance_minor: 0,
      upcoming_minor: 0,
      reserved_minor: 0,
      free_minor: 0,
      per_day_minor: 0,
    });
    db.close();
  });

  it('es idempotente: una segunda aplicación no duplica filas ni cambia montos', () => {
    const estado = estadoDePrueba();
    const db = crearBD();
    const plan = planificarMigracionGastos(estado, CTX_CL);
    aplicar(db, plan);
    const antes = {
      gastos: contar(db, 'SELECT COUNT(*) AS n FROM transactions'),
      categorias: contar(db, 'SELECT COUNT(*) AS n FROM categories'),
      presupuestos: contar(db, 'SELECT COUNT(*) AS n FROM budgets'),
      ledger: contar(db, 'SELECT COUNT(*) AS n FROM ledgers'),
    };
    aplicar(db, plan);
    const despues = {
      gastos: contar(db, 'SELECT COUNT(*) AS n FROM transactions'),
      categorias: contar(db, 'SELECT COUNT(*) AS n FROM categories'),
      presupuestos: contar(db, 'SELECT COUNT(*) AS n FROM budgets'),
      ledger: contar(db, 'SELECT COUNT(*) AS n FROM ledgers'),
    };
    expect(despues).toEqual(antes);
    db.close();
  });

  it('rechaza estados corruptos en lugar de migrar mal', () => {
    const gastoHuerfano: EstadoGastos = {
      ...ESTADO_VACIO,
      gastos: [{ id: 'g-1', fecha: '2026-10-01', monto: 10, categoriaId: 'fantasma', nota: '' }],
    };
    expect(() => planificarMigracionGastos(gastoHuerfano, CTX_CL)).toThrow(/categoría inexistente/);

    const fechaMala: EstadoGastos = {
      ...ESTADO_VACIO,
      gastos: [{ id: 'g-2', fecha: 'no-fecha', monto: 10, categoriaId: 'otros', nota: '' }],
    };
    expect(() => planificarMigracionGastos(fechaMala, CTX_CL)).toThrow(/fecha inválida/);

    const presupuestoHuerfano: EstadoGastos = { ...ESTADO_VACIO, presupuestos: { fantasma: 500 } };
    expect(() => planificarMigracionGastos(presupuestoHuerfano, CTX_CL)).toThrow(/categoría inexistente/);

    expect(() =>
      planificarMigracionGastos(ESTADO_VACIO, { ...CTX_CL, tz: 'America/Santiago' }),
    ).toThrow(/zona horaria inválida/);
  });
});
