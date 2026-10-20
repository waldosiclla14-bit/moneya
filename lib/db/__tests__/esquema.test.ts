import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DECIMALES_POR_MONEDA } from '../migracion';
import { ESQUEMA_SQL } from '../esquema';

const leer = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const normalizar = (texto: string) => texto.replace(/\r\n/g, '\n');

describe('esquema inyectado (lib/db/esquema.ts)', () => {
  it('no deriva de db/moneya_schema.sql', () => {
    expect(normalizar(ESQUEMA_SQL)).toBe(normalizar(leer('../../../db/moneya_schema.sql')));
  });

  it('DECIMALES_POR_MONEDA coincide con la tabla currencies del esquema', () => {
    const db = new DatabaseSync(':memory:');
    db.exec(ESQUEMA_SQL);
    const filas = db.prepare('SELECT code, decimals FROM currencies').all() as {
      code: string;
      decimals: number;
    }[];
    expect(DECIMALES_POR_MONEDA).toEqual(
      Object.fromEntries(filas.map((f) => [f.code, f.decimals])),
    );
    db.close();
  });

  it('el esquema nace sin datos de usuario ni marcador de migración', () => {
    const db = new DatabaseSync(':memory:');
    db.exec(ESQUEMA_SQL);
    const contar = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
    expect(contar('SELECT COUNT(*) AS n FROM ledgers')).toBe(0);
    expect(contar('SELECT COUNT(*) AS n FROM transactions')).toBe(0);
    expect(contar(`SELECT COUNT(*) AS n FROM meta WHERE key = 'migracion_gastos_v1'`)).toBe(0);
    db.close();
  });
});
