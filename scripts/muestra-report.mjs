// Reporte de la muestra: carga db/moneya_schema.sql + db/muestra.sql en SQLite
// (node:sqlite, en memoria) y ejecuta Q1–Q5 con la ventana 2026-10-01..2026-10-31.
// Uso: npm run muestra
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const esquema = readFileSync(join(raiz, 'db', 'moneya_schema.sql'), 'utf8');
const muestra = readFileSync(join(raiz, 'db', 'muestra.sql'), 'utf8');
const consultasSql = readFileSync(join(raiz, 'db', 'consultas-muestra.sql'), 'utf8');

const db = new DatabaseSync(':memory:');
db.exec(esquema);
db.exec(muestra);

const LEDGER_PERSONAL = "'0199f100-0000-7000-8000-000000000001'";
const LEDGER_NEGOCIO = "'0199f100-0000-7000-8000-000000000002'";

const BASE = { from: "'2026-10-01'", to: "'2026-10-31'", today: "'2026-10-20'" };
/** Q1–Q4 leen el libro personal; Q5 (Emprende) lee el libro del negocio. */
export const PARAMS_POR_CONSULTA = [
  { ...BASE, ledger: LEDGER_PERSONAL },
  { ...BASE, ledger: LEDGER_PERSONAL },
  { ...BASE, ledger: LEDGER_PERSONAL },
  { ...BASE, ledger: LEDGER_PERSONAL },
  { ...BASE, ledger: LEDGER_NEGOCIO },
];

/** Sustituye :params por orden seguro (:today antes que :to) y falla si sobra alguno. */
export function parametrizar(sql, params) {
  let out = sql;
  for (const nombre of ['today', 'from', 'ledger', 'to']) {
    out = out.split(`:${nombre}`).join(params[nombre]);
  }
  if (/:[a-z_]+/.test(out)) throw new Error(`Parámetro sin resolver en la consulta: ${out.match(/:[a-z_]+/)[0]}`);
  return out;
}

/** Divide el archivo en las 5 consultas (cada bloque empieza con su comentario "-- Q<n>"). */
export function separarConsultas(sql) {
  const bloques = sql.split(/(?=^-- Q\d)/m).filter((b) => /^-- Q\d/.test(b));
  if (bloques.length !== 5) throw new Error(`Se esperaban 5 consultas, hay ${bloques.length}`);
  return bloques.map((b) => b.replace(/;?\s*$/, ';'));
}

const fmt = (v) =>
  typeof v === 'number' ? v.toLocaleString('es-CL') : v === null || v === undefined ? '—' : String(v);

function imprimir(titulo, filas) {
  console.log(`\n=== ${titulo} ===`);
  if (filas.length === 0) {
    console.log('(sin filas)');
    return;
  }
  const cols = Object.keys(filas[0]);
  const ancho = cols.map((c) => Math.max(c.length, ...filas.map((f) => fmt(f[c]).length)));
  const linea = (vals) => vals.map((v, i) => String(v).padEnd(ancho[i])).join('  ');
  console.log(linea(cols));
  console.log(linea(ancho.map((a) => '-'.repeat(a))));
  for (const f of filas) console.log(linea(cols.map((c) => fmt(f[c]))));
}

const consultas = separarConsultas(consultasSql);
const titulos = [
  'Q1 · Libre hoy · libro personal (CLP)',
  'Q2 · Gastos por categoría · libro personal (CLP)',
  'Q3 · Presupuestos con alerta · libro personal (CLP)',
  'Q4 · Bienestar: deuda/ingreso y colchón · libro personal',
  'Q5 · Emprende: resultado del período · libro de negocio (CLP)',
];

const resultados = consultas.map((sql, i) => {
  const filas = db.prepare(parametrizar(sql, PARAMS_POR_CONSULTA[i])).all();
  imprimir(titulos[i], filas);
  return filas;
});

const integridad = db.prepare('PRAGMA integrity_check').all();
const fks = db.prepare('PRAGMA foreign_key_check').all();
const version = db.prepare("SELECT value FROM meta WHERE key='schema_version'").get();
imprimir('Salud del esquema', [
  {
    schema_version: version.value,
    integrity_check: integridad[0].integrity_check,
    fk_errors: fks.length,
  },
]);

const conteo = db
  .prepare(
    `SELECT 'transacciones' AS tabla, COUNT(*) AS n FROM transactions
     UNION ALL SELECT 'gastos efectivos', COUNT(*) FROM v_tx_effective WHERE type = 'expense'
     UNION ALL SELECT 'pendientes de revisión', COUNT(*) FROM transactions WHERE status = 'pending_review'
     UNION ALL SELECT 'borradas (lógico)', COUNT(*) FROM transactions WHERE deleted_at IS NOT NULL
     UNION ALL SELECT 'cuentas', COUNT(*) FROM accounts
     UNION ALL SELECT 'categorías', COUNT(*) FROM categories`,
  )
  .all();
imprimir('Conteos de la muestra', conteo);

// Resumen de coherencia (mismo invariante que verifica la prueba)
const q1 = resultados[0][0];
const invariante = q1.balance_minor - q1.upcoming_minor - q1.reserved_minor === q1.free_minor;
console.log(`\nInvariante Q1 (saldo − vencidos − reservado = libre): ${invariante ? 'OK' : 'ERROR'}`);

const estados = new Set(resultados[2].map((r) => r.state));
console.log(`Estados de presupuesto presentes: ${[...estados].sort().join(', ')}`);

console.log(`\nDatos 100% ficticios (db/muestra.sql). Ventana: 2026-10-01 a 2026-10-31, hoy = 2026-10-20.`);
