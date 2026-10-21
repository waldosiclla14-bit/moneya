// Copia el runtime de sqlite-wasm para que la app lo sirva fuera del bundle:
//   - public/sqlite/   lo sirve Next en local y en `next build` lo vuelca a out/
//   - out/sqlite/      red de seguridad para el build `export`
//     (NEXT_SKIP_SQLITE_OUT=1 lo omite; lo usa el postinstall para no ensuciar
//      artifacts/CI con un `out/` obsoleto)
// Archivos:
//   - index.mjs            módulo ESM que carga la app en navegador (motor.ts)
//   - sqlite3-worker1.mjs  vecino que index.mjs referencia con new URL(..., import.meta.url)
//   - sqlite3.wasm         binario (locateFile y new URL relativo a index.mjs)
// El destino está en .gitignore: es un artefacto de node_modules, no del repo.
// Contexto: ADR-0012 (kvvfs localStorage en hilo principal; en navegador el
// paquete se sirve como ESM nativo **fuera del bundle** — un import con
// expresión en motor.ts evita que el bundler analice sqlite3-worker1.mjs, cuyo
// `new Worker(new URL(proxyUri, ...))` dinámico rompía Turbopack, verificado en
// CI 2026-10-20).
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'node_modules', '@sqlite.org', 'sqlite-wasm', 'dist');
const archivos = ['index.mjs', 'sqlite3-worker1.mjs', 'sqlite3.wasm'];

const destinosDir = [path.join(raiz, 'public', 'sqlite')];
// El build `export` puede no incluir public/ en out/ de forma fiable con
// basePath; si out/ existe (post-build), se refresca para que el artefacto lo
// lleve. No se crea out/ si no existe (evita residuos en el repo).
if (process.env.NEXT_SKIP_SQLITE_OUT !== '1') {
  const outDir = path.join(raiz, 'out');
  if (existsSync(outDir)) destinosDir.push(path.join(outDir, 'sqlite'));
}

for (const destinoDir of destinosDir) {
  mkdirSync(destinoDir, { recursive: true });
  for (const nombre of archivos) {
    const origen = path.join(dist, nombre);
    const destino = path.join(destinoDir, nombre);
    const { size } = statSync(origen);
    copyFileSync(origen, destino);
    console.log(`OK ${nombre} -> ${path.relative(raiz, destino)} (${size} bytes).`);
  }
}
