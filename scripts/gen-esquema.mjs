// Genera lib/db/esquema.ts a partir de db/moneya_schema.sql (fuente única del modelo).
// Uso: npm run gen:esquema  ·  La deriva entre archivo y módulo se detecta en
// lib/db/__tests__/esquema.test.ts (corre en CI).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origen = path.join(raiz, 'db', 'moneya_schema.sql');
const destino = path.join(raiz, 'lib', 'db', 'esquema.ts');

const sql = readFileSync(origen, 'utf8').replace(/\r\n/g, '\n');

if (sql.includes('`')) {
  throw new Error('El esquema contiene backticks: no puede ir dentro de un template literal.');
}
if (sql.includes('${')) {
  throw new Error('El esquema contiene "${": no puede ir dentro de un template literal.');
}

const cabecera = [
  '// GENERADO por scripts/gen-esquema.mjs — NO EDITAR A MANO.',
  '// Fuente única: db/moneya_schema.sql. Regenerar con `npm run gen:esquema`;',
  '// la deriva se detecta en lib/db/__tests__/esquema.test.ts.',
  '',
  '',
].join('\n');

const contenido = `${cabecera}export const ESQUEMA_SQL = \`${sql}\`;\n`;

writeFileSync(destino, contenido, 'utf8');
console.log(`OK ${path.relative(raiz, destino).replace(/\\/g, '/')} (${sql.length} bytes de SQL).`);
