import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * La muestra (db/muestra.sql) son datos 100% ficticios para probar el esquema
 * y las consultas clave. Esta prueba carga esquema + muestra en SQLite en
 * memoria y verifica invariantes financieros y valores de referencia.
 */

const LEDGER_PERSONAL = "'0199f100-0000-7000-8000-000000000001'";
const LEDGER_NEGOCIO = "'0199f100-0000-7000-8000-000000000002'";
const BASE = { from: "'2026-10-01'", to: "'2026-10-31'", today: "'2026-10-20'" };

const leer = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

function parametrizar(sql: string, params: Record<string, string>): string {
  let out = sql;
  for (const nombre of ['today', 'from', 'ledger', 'to']) {
    out = out.split(`:${nombre}`).join(params[nombre]);
  }
  if (/:[a-z_]+/.test(out)) throw new Error(`Parámetro sin resolver: ${out.match(/:[a-z_]+/)?.[0]}`);
  return out;
}

function separarConsultas(sql: string): string[] {
  const bloques = sql.split(/(?=^-- Q\d)/m).filter((b) => /^-- Q\d/.test(b));
  if (bloques.length !== 5) throw new Error(`Se esperaban 5 consultas, hay ${bloques.length}`);
  return bloques.map((b) => b.replace(/;?\s*$/, ';'));
}

describe('muestra (db/muestra.sql)', () => {
  let db: DatabaseSync;
  let consultas: string[];

  const correr = (i: number, ledger = i === 4 ? LEDGER_NEGOCIO : LEDGER_PERSONAL) =>
    db.prepare(parametrizar(consultas[i], { ...BASE, ledger })).all() as Record<string, number | string | null>[];

  beforeAll(() => {
    db = new DatabaseSync(':memory:');
    db.exec(leer('../../../db/moneya_schema.sql'));
    db.exec(leer('../../../db/muestra.sql'));
    consultas = separarConsultas(leer('../../../db/consultas-muestra.sql'));
  });

  it('carga sin violar claves foráneas y deja los conteos esperados', () => {
    const filas = db
      .prepare(
        `SELECT (SELECT COUNT(*) FROM transactions) AS transacciones,
                (SELECT COUNT(*) FROM v_tx_effective WHERE type='expense') AS gastos_efectivos,
                (SELECT COUNT(*) FROM transactions WHERE status='pending_review') AS pendientes,
                (SELECT COUNT(*) FROM transactions WHERE deleted_at IS NOT NULL) AS borradas,
                (SELECT COUNT(*) FROM accounts) AS cuentas,
                (SELECT COUNT(*) FROM categories) AS categorias`,
      )
      .all() as Record<string, number>[];
    expect(filas[0]).toEqual({
      transacciones: 34,
      gastos_efectivos: 23,
      pendientes: 1,
      borradas: 1,
      cuentas: 6,
      categorias: 21,
    });
  });

  it('Q1: el saldo libre cumple el invariante y tiene los valores de referencia', () => {
    const q1 = correr(0)[0] as Record<string, number>;
    expect(q1.balance_minor - q1.upcoming_minor - q1.reserved_minor).toBe(q1.free_minor);
    expect(q1.balance_minor).toBe(1_656_300);
    expect(q1.upcoming_minor).toBe(40_980); // internet 18.990 + gimnasio 21.990, vencen hasta el 31-10
    expect(q1.reserved_minor).toBe(155_000); // 80.000 del fondo + 75.000 del notebook
    expect(q1.free_minor).toBe(1_460_320);
    expect(q1.per_day_minor).toBe(121_693); // 12 días del 20 al 31 de octubre
  });

  it('Q2: suma las 9 categorías y excluye lo pendiente y lo borrado', () => {
    const filas = correr(1);
    expect(filas).toHaveLength(9);
    const total = filas.reduce((s, f) => s + (f.spent_minor as number), 0);
    expect(total).toBe(782_790);

    // Mismo gasto sin filtros: incluiría el pendiente de revisión (4.500) y el duplicado borrado (12.000)
    const crudo = db
      .prepare(
        `SELECT COALESCE(SUM(amount_minor),0) AS v FROM transactions
         WHERE ledger_id = ${LEDGER_PERSONAL} AND type='expense'`,
      )
      .get() as Record<string, number>;
    expect(crudo.v).toBe(total + 4_500 + 12_000);

    expect(filas[0].name).toBe('Arriendo / Hipoteca');
    expect(filas[0].spent_minor).toBe(430_000);
    expect(filas[0].pct).toBeCloseTo(54.9, 1);
  });

  it('Q3: muestra los tres estados de presupuesto (ok, warn, over)', () => {
    const filas = correr(2);
    expect(filas).toHaveLength(5);
    const estados = new Set(filas.map((f) => f.state));
    expect([...estados].sort()).toEqual(['ok', 'over', 'warn']);

    const porNombre = Object.fromEntries(filas.map((f) => [f.name, f]));
    expect(porNombre['Restaurantes'].state).toBe('over');
    expect(porNombre['Restaurantes'].pct_used).toBe(118);
    expect(porNombre['Transporte'].state).toBe('warn');
    expect(porNombre['Transporte'].pct_used).toBe(91);
    expect(porNombre['Mercado'].state).toBe('ok');
  });

  it('Q4: relación deuda/ingreso y meses de colchón', () => {
    const q4 = correr(3)[0];
    expect(q4.debt_to_income_pct).toBeCloseTo(2.5, 1); // 45.000 / 1.780.000
    expect(q4.cushion_months).toBeCloseTo(4.4, 1); // 2.070.000 / 470.390
  });

  it('Q5: resultado del negocio y los retiros no se cuentan como costo', () => {
    const q5 = correr(4)[0] as Record<string, number>;
    expect(q5.ingresos_minor).toBe(631_500);
    expect(q5.costos_minor).toBe(513_490);
    expect(q5.retiros_dueno_minor).toBe(150_000);
    expect(q5.utilidad_minor).toBe(118_010);
    expect(q5.ingresos_minor - q5.costos_minor).toBe(q5.utilidad_minor);

    const gastosNegocio = db
      .prepare(
        `SELECT COALESCE(SUM(amount_minor),0) AS v FROM v_tx_effective
         WHERE ledger_id = ${LEDGER_NEGOCIO} AND type='expense'`,
      )
      .get() as Record<string, number>;
    expect(q5.costos_minor + q5.retiros_dueno_minor).toBe(gastosNegocio.v);
  });

  it('vincula el retiro del negocio con el ingreso personal', () => {
    const par = db
      .prepare(
        `SELECT a.id, a.linked_tx_id, b.id AS id_b, b.linked_tx_id AS linked_b
           FROM transactions a JOIN transactions b ON b.id = a.linked_tx_id
          WHERE a.id = '0199f100-0021-7000-8000-000000000011'`,
      )
      .all() as Record<string, string>[];
    expect(par).toHaveLength(1);
    expect(par[0].linked_tx_id).toBe('0199f100-0011-7000-8000-000000000023');
    expect(par[0].linked_b).toBe('0199f100-0021-7000-8000-000000000011');
  });
});
