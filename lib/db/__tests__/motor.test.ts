import { describe, expect, it } from 'vitest';
import {
  ESTADO_VACIO,
  agregarGasto,
  actualizarPresupuesto,
  totalGastos,
  totalesPorCategoria,
  type EstadoGastos,
} from '../../gastos/modelo';
import { ESQUEMA_SQL } from '../esquema';
import { IDS, aUnidadesMinimas, planificarMigracionGastos, type ContextoMigracion } from '../migracion';
import { abrirBaseLocal, abrirMotor, aplicarEsquemaSiVacia, ejecutarPlan } from '../motor';

/**
 * Motor sqlite-wasm real (paquete @sqlite.org/sqlite-wasm): en Node/CI corre el
 * build `node` en memoria. Verifica que esquema, migración y transacciones
 * funcionan en el mismo motor que usará la app (SQLite 3.54.1 wasm), y no solo
 * en node:sqlite como hace migracion.test.ts.
 */

const CTX_CL: ContextoMigracion = { pais: 'CL', tz: '-03:00', ahora: '2026-10-20T12:00:00.000Z' };

/** 2 gastos CLP (1500 · 400) y 1 presupuesto (1000). */
function estadoDePrueba(): EstadoGastos {
  let estado: EstadoGastos = { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
  estado = agregarGasto(estado, { fecha: '2026-10-03', monto: 1500, categoriaId: 'alimentacion', nota: 'Feria' });
  estado = agregarGasto(estado, { fecha: '2026-10-05', monto: 400, categoriaId: 'transporte' });
  estado = actualizarPresupuesto(estado, 'alimentacion', 1000);
  return estado;
}

describe('motor sqlite-wasm (lib/db/motor.ts)', () => {
  it('carga el motor real una vez (singleton) y reporta su versión', async () => {
    const a = await abrirMotor();
    const b = await abrirMotor();
    expect(a).toBe(b);
    expect(a.version.libVersion).toMatch(/^3\.\d+\.\d+/);

    const db = new a.oo1.DB(':memory:', 'c');
    db.exec('CREATE TABLE prueba (n INTEGER); INSERT INTO prueba VALUES (7);');
    expect(db.selectValue('SELECT n FROM prueba')).toBe(7);
    db.close();
  });

  it('aplica el esquema maestro completo en el motor real, una sola vez', async () => {
    const sqlite3 = await abrirMotor();
    const db = new sqlite3.oo1.DB(':memory:', 'c');

    expect(aplicarEsquemaSiVacia(db)).toBe(true);
    expect(aplicarEsquemaSiVacia(db)).toBe(false); // ya aplicado: idempotente

    expect(db.selectValue('PRAGMA integrity_check')).toBe('ok');
    // 25 tablas del esquema (excluye las internas de SQLite, p. ej. sqlite_sequence).
    expect(db.selectValue("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")).toBe(25);
    expect(db.selectValue("SELECT COUNT(*) FROM sqlite_master WHERE type = 'view'")).toBe(2);
    expect(db.selectValue("SELECT value FROM meta WHERE key = 'schema_version'")).toBe('0.1.0');
    db.close();
  });

  it('ejecuta la migración de gastos completa en el motor real', async () => {
    const sqlite3 = await abrirMotor();
    const db = new sqlite3.oo1.DB(':memory:', 'c');
    expect(aplicarEsquemaSiVacia(db)).toBe(true);

    const estado = estadoDePrueba();
    ejecutarPlan(db, planificarMigracionGastos(estado, CTX_CL));

    expect(db.selectValue('SELECT COUNT(*) FROM categories WHERE ledger_id = ?', [IDS.ledger])).toBe(
      estado.categorias.length,
    );
    expect(db.selectValue('SELECT COUNT(*) FROM v_tx_effective')).toBe(estado.gastos.length);
    expect(db.selectValue('SELECT COUNT(*) FROM meta WHERE key = ?', [IDS.marcadorMigracion])).toBe(1);

    // Paridad de totales con el modelo (CLP: unidades mínimas = pesos enteros).
    const esperado = totalesPorCategoria(estado.gastos);
    const filas = db.selectObjects('SELECT category_id, SUM(amount_minor) AS gastado FROM v_tx_effective GROUP BY category_id');
    expect(filas).toHaveLength(Object.keys(esperado).length);
    for (const fila of filas) {
      expect(Number(fila.gastado)).toBe(aUnidadesMinimas(esperado[String(fila.category_id)], 'CLP'));
    }
    expect(db.selectValue('SELECT amount_minor FROM budgets WHERE category_id = ?', ['alimentacion'])).toBe(
      aUnidadesMinimas(1000, 'CLP'),
    );
    expect(db.selectValue('SELECT SUM(amount_minor) FROM v_tx_effective')).toBe(
      aUnidadesMinimas(totalGastos(estado.gastos), 'CLP'),
    );
    db.close();
  });

  it('ejecutarPlan revierte todo si un paso falla (no migra a medias)', async () => {
    const sqlite3 = await abrirMotor();
    const db = new sqlite3.oo1.DB(':memory:', 'c');
    expect(aplicarEsquemaSiVacia(db)).toBe(true);

    expect(() =>
      ejecutarPlan(db, [
        { sql: "INSERT INTO meta (key, value) VALUES ('clave_prueba', '1')", params: [] },
        { sql: 'INSERT INTO tabla_inexistente (x) VALUES (1)', params: [] },
      ]),
    ).toThrow();
    expect(db.selectValue("SELECT COUNT(*) FROM meta WHERE key = 'clave_prueba'")).toBe(0);
    db.close();
  });

  it('abrirBaseLocal lanza un error claro fuera del navegador (CI: sin kvvfs)', async () => {
    await expect(abrirBaseLocal()).rejects.toThrow(/localStorage/);
  });
});
