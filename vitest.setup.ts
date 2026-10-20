import { usarCargadorSqlite } from './lib/db/motor';

// El literal `@sqlite.org/sqlite-wasm` vive solo aquí: este archivo está fuera
// del grafo que Next empaqueta. En `lib/db/motor.ts` un import literal (o un
// import con expresión) rompe el build de Turbopack al seguir
// dist/sqlite3-worker1.mjs (CI 2026-10-20, runs 39501321016 y 39502260266).
// Ver motor.ts → abrirMotor.
usarCargadorSqlite(() => import('@sqlite.org/sqlite-wasm'));
