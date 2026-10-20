// Copia el wasm de sqlite-wasm a public/sqlite/ para que la app lo sirva en
// ${NEXT_PUBLIC_BASE_PATH}/sqlite/sqlite3.wasm (local y en GitHub Pages).
// Se ejecuta en postinstall (package.json). El destino está en .gitignore:
// es un artefacto de node_modules, no un archivo del repo.
// Contexto: ADR-0012 (kvvfs localStorage en hilo principal; el wasm es lo único
// que hay que hospedar fuera del bundle).
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origen = path.join(raiz, 'node_modules', '@sqlite.org', 'sqlite-wasm', 'dist', 'sqlite3.wasm');
const destinoDir = path.join(raiz, 'public', 'sqlite');
const destino = path.join(destinoDir, 'sqlite3.wasm');

const { size } = statSync(origen);
mkdirSync(destinoDir, { recursive: true });
copyFileSync(origen, destino);
console.log(`OK sqlite3.wasm -> public/sqlite/sqlite3.wasm (${size} bytes).`);
