import type { Database, Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import type { PasoSql } from './migracion';
import { ESQUEMA_SQL } from './esquema';

/**
 * Motor de ejecución de SQLite en la app (ADR-0012: kvvfs sobre localStorage,
 * en hilo principal; sin worker y sin cabeceras COOP/COEP, porque el hosting
 * oficial es GitHub Pages — ADR-0001).
 *
 * Fuera del navegador (tests/CI) se usa el build `node` del paquete: motor real
 * en memoria, sin kvvfs. Lo que es comportamiento de navegador (locateFile,
 * JsStorageDb) queda separado y con guarda explícita.
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

let motorEnCurso: Promise<Sqlite3Static> | undefined;
let baseLocal: Database | undefined;

/**
 * El entorno no puede ofrecer kvvfs (build node, jsdom de tests o navegador sin
 * localStorage). No es un fallo de almacenamiento: es "este entorno nunca tendrá
 * la base SQL", y permite al llamador usar el respaldo local equivalente sin
 * ocultar fallos reales de cuota o de descarga del wasm (esos propagan otro error).
 */
export class ErrorSinKvvfs extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorSinKvvfs';
  }
}

/**
 * Carga e inicializa sqlite-wasm una sola vez por página (singleton).
 *
 * En navegador el módulo se sirve como **ESM nativo fuera del bundle**
 * (${BASE_PATH}/sqlite/index.mjs, copiado por scripts/copy-sqlite-wasm.mjs).
 * El import se construye con new Function a propósito: con import literal el
 * bundler seguía dist/index.mjs → new Worker(new URL("sqlite3-worker1.mjs"))
 * → sqlite3-worker1.mjs, cuyo `new Worker(new URL(proxyUri, ...))` con
 * proxyUri dinámico rompe el build de Turbopack ("Can't resolve <dynamic>",
 * CI 2026-10-20 run 39501321016), e incluso import(expr) falla en Turbopack
 * (run 39502260266). Fuera del navegador (tests/CI) la misma ruta resuelve el
 * bare specifier con el build `node`.
 *
 * locateFile solo se pasa en navegador: el build `node` también lo respeta y
 * una ruta de navegador rompería la carga (verificado 2026-10-20: locateFile
 * con ruta inexistente → ENOENT en Node).
 */
export async function abrirMotor(): Promise<Sqlite3Static> {
  if (!motorEnCurso) motorEnCurso = cargarMotor();
  return motorEnCurso;
}

/**
 * ¿Es un navegador real? jsdom (entorno de tests) tiene `window` pero no ofrece
 * kvvfs ni sirve el wasm en `/sqlite/`: se trata como "no navegador" para no
 * pasarle locateFile y para que abrirBaseLocal falle claro (ErrorSinKvvfs) sin
 * cargar el motor. Verificado 2026-10-20: en jsdom, init() con locateFile →
 * ENOENT `C:\sqlite\sqlite3.wasm`; sin locateFile carga el build node.
 */
function esNavegadorReal(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return !/jsdom/i.test(navigator.userAgent);
}

async function cargarMotor(): Promise<Sqlite3Static> {
  const navegadorReal = esNavegadorReal();
  let cargador = cargadorSqlite;
  if (!cargador) {
    if (!navegadorReal) {
      throw new Error(
        'cargarMotor: falta inyectar el cargador del paquete (usarCargadorSqlite) fuera del navegador.',
      );
    }
    // Import construido con new Function hacia el ESM servido en public/sqlite/
    // (el cuerpo es un string: el bundler no lo analiza). En navegador ejecuta
    // import('/…/sqlite/index.mjs'); requiere no enviar CSP con 'unsafe-eval'
    // (GitHub Pages no envía cabeceras, ADR-0001). Ver doc de abrirMotor.
    const importar = new Function('ruta', 'return import(ruta)') as unknown as (
      ruta: string,
    ) => Promise<unknown>;
    cargador = () => importar(`${BASE_PATH}/sqlite/index.mjs`) as Promise<{ default: InitDelPaquete }>;
    cargadorSqlite = cargador;
  }
  const paquete = await cargador();
  const opciones = navegadorReal
    ? { locateFile: (ruta: string) => `${BASE_PATH}/sqlite/${ruta}` }
    : undefined;
  return paquete.default(opciones);
}

// index.d.mts declara `init()` sin argumentos, pero dist/index.mjs sí lee
// args[0]?.locateFile (sIMS.emscriptenLocateFile). Verificado 2026-10-20.
export type InitDelPaquete = (
  opciones?: { locateFile?: (ruta: string) => string },
) => Promise<Sqlite3Static>;

export type CargadorSqlite = () => Promise<{ default: InitDelPaquete }>;

let cargadorSqlite: CargadorSqlite | undefined;

/**
 * Fija cómo se carga el paquete sqlite-wasm. Lo usan los tests (setup de vitest)
 * para inyectar `() => import('@sqlite.org/sqlite-wasm')`: ese literal no puede
 * vivir en este archivo porque el bundler de producción lo sigue hasta
 * dist/sqlite3-worker1.mjs y Turbopack falla allí (CI 2026-10-20). Sin
 * inyección, solo en navegador real, cargarMotor construye su propio import.
 */
export function usarCargadorSqlite(cargador: CargadorSqlite): void {
  cargadorSqlite = cargador;
}

/**
 * Abre (o reabre) la base de datos local kvvfs en `localStorage` y aplica el
 * esquema maestro solo si la base está vacía (idempotente).
 *
 * Solo funciona en navegador: fuera de él lanza un error claro (el build node no
 * incluye kvvfs ni localStorage). kvvfs persiste página a página en
 * localStorage; no requiere export/import manual.
 */
export async function abrirBaseLocal(): Promise<Database> {
  if (!esNavegadorReal() || typeof globalThis.localStorage === 'undefined') {
    throw new ErrorSinKvvfs('abrirBaseLocal: kvvfs requiere un navegador con localStorage (ADR-0012).');
  }
  const sqlite3 = await abrirMotor();
  if (typeof sqlite3.oo1.JsStorageDb !== 'function') {
    throw new ErrorSinKvvfs('abrirBaseLocal: este build de sqlite-wasm no incluye JsStorageDb (kvvfs).');
  }
  if (!baseLocal) {
    const db = new sqlite3.oo1.JsStorageDb('local');
    aplicarEsquemaSiVacia(db);
    baseLocal = db;
  }
  return baseLocal;
}

/**
 * Aplica ESQUEMA_SQL solo si la base no tiene tablas; devuelve true si lo aplicó.
 * (El esquema no usa IF NOT EXISTS: se aplica una sola vez, a una base vacía.)
 */
export function aplicarEsquemaSiVacia(db: Database): boolean {
  const existente = db.selectValue("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'meta'");
  if (existente !== undefined) return false;
  db.exec(ESQUEMA_SQL);
  return true;
}

/**
 * Ejecuta un plan SQL (p. ej. la migración de gastos) en una sola transacción.
 * Ante el primer error revierte todo: mejor no migrar que migrar a medias.
 */
export function ejecutarPlan(db: Database, plan: readonly PasoSql[]): void {
  db.exec('BEGIN');
  try {
    for (const paso of plan) db.exec(paso.sql, { bind: [...paso.params] });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
