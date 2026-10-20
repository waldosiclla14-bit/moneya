// Copia el runtime de sqlite-wasm a public/sqlite/ para que la app lo sirva en
// ${NEXT_PUBLIC_BASE_PATH}/sqlite/ (local y en GitHub Pages):
//   - index.mjs            módulo ESM que carga la app en navegador (motor.ts)
//   - sqlite3-worker1.mjs  vecino que index.mjs referencia con new URL(..., import.meta.url)
//   - sqlite3.wasm         binario (locateFile y new URL relativo a index.mjs)
// Se ejecuta en postinstall (package.json). El destino está en .gitignore:
// es un artefacto de node_modules, no un archivo del repo.
// Contexto: ADR-0012 (kvvfs localStorage en hilo principal; en navegador el
// paquete se sirve como ESM nativo **fuera del bundle** — un import con
// expresión en motor.ts evita que el bundler analice sqlite3-worker1.mjs, cuyo
// `new Worker(new URL(proxyUri, ...))` dinámico rompía Turbopack, verificado en
// CI 2026-10-20).
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'node_modules', '@sqlite.org', 'sqlite-wasm', 'dist');
const destinoDir = path.join(raiz, 'public', 'sqlite');

const archivos = ['index.mjs', 'sqlite3-worker1.mjs', 'sqlite3.wasm'];
mkdirSync(destinoDir, { recursive: true });
for (const nombre of archivos) {
  const origen = path.join(dist, nombre);
  const destino = path.join(destinoDir, nombre);
  const { size } = statSync(origen);
  copyFileSync(origen, destino);
  console.log(`OK ${nombre} -> public/sqlite/${nombre} (${size} bytes).`);
}
