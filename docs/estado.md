# Estado de MONEYA — log de sesión

Protocolo: AGENTS.md §2.5. Cada sesión cierra con decisiones, archivos, verificación y siguiente paso.

---

## 2026-10-20 · Paso 3 del adapter SQLite: UI de gastos conectada a la base local

### Decisiones tomadas y por qué

1. **`lib/db/gastos-repo.ts` como fachada única de la UI.** `gestor-gastos.tsx` ya no importa reducers ni `leerEstado`/`escribirEstado`: cada operación valida con los reducers puros de `lib/gastos/modelo.ts`, escribe en SQLite (unidades mínimas enteras) y **re-hidrata** desde la base — la base es la verdad. Esto resuelve de paso el redondeo CLP (pesos enteros) de forma consistente: lo que se muestra es lo que la base guarda convertido con `DECIMALES_POR_MONEDA`.
2. **Fallback local solo con `ErrorSinKvvfs`** (clase nueva en `motor.ts`): si kvvfs es imposible en el entorno (Node, jsdom) → `crearRepositorioLocal()` con el mismo contrato sobre localStorage legado; si kvvfs existe pero falla (cuota, wasm 404) → el error se propaga y la UI lo muestra (banner), **sin** respaldo silencioso — evita doble verdad y pérdida de datos cuando ya existe el marcador de migración.
3. **jsdom ≠ navegador real** (`esNavegadorReal()` en `motor.ts`): verificado en sesión — en jsdom, `init({ locateFile })` → ENOENT `C:\sqlite\sqlite3.wasm`, y sin `locateFile` carga el build `node` (`oo1.JsStorageDb` ausente). Por eso jsdom no recibe `locateFile` y `abrirBaseLocal` lanza `ErrorSinKvvfs` antes de cargar el wasm (los 4 tests del componente siguen en el modo legado y pasan sin cambios).
4. **`rowid` no existe dentro de la vista `v_tx_effective`** (sonda en sesión: `SQLITE_ERROR: no such column: rowid`; sí funciona sobre la tabla base). La hidratación consulta `transactions` con los mismos predicados que la vista (`status='confirmed' AND deleted_at IS NULL` + libro + tipo) ordenando por `occurred_on DESC, rowid DESC` (conserva el orden de inserción del mismo día); un test verifica la paridad filas/suma entre consulta directa y vista.
5. **País de la migración desde el perfil:** `paisParaMigracion()` en el componente pide el país a Supabase (`obtenerPerfil`) antes de migrar, para no crear el libro con el país por defecto mientras `RegionProvider` aún carga el perfil; sin cliente/sesión o con error → país del contexto.
6. **Presupuestos: borrado duro** (DELETE) en vez de soft-delete: `budgets` es `UNIQUE(ledger_id, category_id)` y una fila borrada lógicamente dejaría la cláusula `ON CONFLICT` sin poder recrear el presupuesto. Upsert con `ON CONFLICT DO UPDATE` sin objetivo de conflicto (SQLite ≥ 3.35; motor real 3.54.1).
7. **El paquete sqlite-wasm se sirve como ESM nativo fuera del bundle en navegador.** El primer push del Paso 3 (`fc03c46`, CI run 39501321016) **falló en build**: Turbopack seguía `gestor-gastos.tsx → motor.ts → dist/index.mjs → new Worker(new URL("sqlite3-worker1.mjs"))` y al analizar `sqlite3-worker1.mjs` se topaba con `new Worker(new URL(proxyUri, import.meta.url))` de opfsUtil (`proxyUri` dinámico) → `Error: Module not found: Can't resolve <dynamic>` (el job `security` pasó ✓). Solución: `motor.ts` carga el módulo con un **import cuyo destino es una expresión** (`${BASE_PATH}/sqlite/index.mjs` en navegador, bare specifier en Node/tests) para que el bundler no lo analice, y `copy-sqlite-wasm.mjs` copia además `index.mjs` y `sqlite3-worker1.mjs` a `public/sqlite/` (vecinos que las `new URL(..., import.meta.url)` del propio paquete resuelven). El build quedó por verificar en CI (no ejecutable en local por RAM, AGENTS §15).

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `lib/db/gastos-repo.ts` (nuevo) | `RepositorioGastos` (leer/guardar/quitar/crear categoría/presupuesto), `abrirRepositorioGastos(ctx)` (abre + migra si falta marcador), `crearRepositorio(db)` (SQL), `crearRepositorioLocal()` (legado), `tzDelDispositivo()` |
| `lib/db/__tests__/gastos-repo.test.ts` (nuevo) | 10 tests: fallback sin kvvfs, round-trip migración→hidratación (`toEqual`), decimales PEN/CLP y rechazo de montos que redondean a 0, categoría desconocida sin escritura, soft-delete, sort_order y duplicados de categorías, presupuestos (upsert/update/0→borrar→recrear), paridad con `v_tx_effective`, formato de tz |
| `lib/db/motor.ts` | `ErrorSinKvvfs`, `esNavegadorReal()` (jsdom excluido de locateFile/guard kvvfs), carga del paquete por expresión de import (fuera del bundle) |
| `scripts/copy-sqlite-wasm.mjs` | ahora copia 3 archivos: `index.mjs`, `sqlite3-worker1.mjs`, `sqlite3.wasm` → `public/sqlite/` |
| `components/gastos/gestor-gastos.tsx` | init async (país del perfil → `abrirRepositorioGastos`), `accion()` centraliza try/catch y banner de error de persistencia; sin escritura a localStorage |
| `README.md` | conteos 174/31, estado (UI conectada) |
| `db/README.md` | conteos de tests (+gastos-repo 10), estado "UI conectada", "Falta" actualizado |
| `docs/estado.md` | esta entrada |

### Qué se probó y cómo (comando + resultado)

- `npm run typecheck` → **sin errores** (2 intermedios corregidos: `SqlValue | undefined` no propagaba el narrowing a las closures → `const moneda: string`).
- `npm test` → **174 passed (174), 31 archivos** (antes: 164/30; +10 del repositorio).
- `npm run muestra` → salud del esquema OK (`integrity_check = ok`, `fk_errors = 0`, `schema_version = 0.1.0`), invariante Q1 OK.
- `node scripts/copy-sqlite-wasm.mjs` → 3 archivos copiados (656.872 + 650.116 + 879.084 bytes).
- CI run 39501321016 (push `fc03c46`) → **build falló** (Turbopack, `sqlite3-worker1.mjs:15864 Can't resolve <dynamic>`); typecheck ✓ y security ✓ en ese mismo run. Fix aplicado (decisión 7); **build pendiente de re-confirmar en el siguiente run**.
- Sonda de `rowid` en sesión: desde la vista → `no such column: rowid`; desde la tabla → OK (documentado en el código).
- Prueba scratch en jsdom (sesión): carga el build `node` (`libVersion 3.54.1`, `JsStorageDb` ausente); con `locateFile` → ENOENT (origen del cambio `esNavegadorReal`).
- Tests del componente `gestor-gastos` (jsdom, 4) → pasan con el fallback local, incluida la aserción de persistencia legada.

### Errores pendientes y decisiones que requieren validación humana

- **Prueba manual en navegador pendiente** (AGENTS §15): primer uso con kvvfs (migración real desde localStorage), persistencia entre recargas, `QuotaExceededError` (5 MiB), carga del wasm con `locateFile` en `next dev` y en build `export`, y que GitHub Pages sirva `index.mjs`/`sqlite3-worker1.mjs` con MIME de JavaScript (los módulos nativos lo exigen).
- **Build de Turbopack:** el import por expresión debe seguir sin romper el build (se verá en el siguiente run de CI); si Turbopack emitiera error en vez de warning, alternativa: alias a stub de `sqlite3-worker1.mjs`.
- **País:** si `obtenerPerfil` falla por red, el libro se crea con el país del contexto (posible CL vs PE); un cambio de país **posterior** a la migración no re-migra ni cambia la moneda del libro (el marcador lo impide) — decisión de diseño pendiente.
- I/O síncrono de kvvfs en hilo principal (rendimiento con volúmenes grandes) sin medir.
- Bug conocido y no abordado (diferido por decisión del usuario): `lib/formato/moneda.ts:22` → `maximumFractionDigits: 0` (montos PEN sin decimales).
- ADR pendiente si el hosting cambia (OPFS requeriría otro hosting → nuevo ADR).

### Siguiente paso

**Prueba manual en navegador del Paso 3** (checklist arriba) y, con eso verde, definir con Waldosiclla el siguiente bloque (sync/backend diferido O1, o siguiente pantalla del MVP).

## 2026-10-20 · Paso 2 del adapter SQLite: motor sqlite-wasm + ADR-0012

### Decisiones tomadas y por qué

1. **Backend de almacenamiento: kvvfs sobre `localStorage` en hilo principal** (no OPFS). Motivo: OPFS exige cabeceras `COOP`/`COEP` que GitHub Pages no soporta — [verificado 2026-10-20] README de `@sqlite.org/sqlite-wasm` (líneas 42–44 y 140–142 en `node_modules`), `opfsUtil.vfsInstallationFeatureCheck` en `dist/index.mjs`, y la petición abierta `github.com/orgs/community/discussions/13309`. Elegido por **Waldosiclla** mediante pregunta en sesión (opción "kvvfs localStorage"). Registrado en **ADR-0012**; ADR-0011 conserva su estado anotado (backend → ADR-0012).
2. **`locateFile` solo en navegador.** Verificado en sesión: el build `node` del paquete también respeta `locateFile` y con ruta inexistente falla con ENOENT → en Node se pasa `undefined`.
3. **Cuota honesta:** 5 MiB de `localStorage` por origen — [verificado 2026-10-20] MDN, *Storage quotas and eviction criteria* (developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria, abierto en sesión); `QuotaExceededError` queda como pendiente de UI.
4. **CI prueba el motor real:** esquema, migración y transacción se ejecutan con el build `node` de `@sqlite.org/sqlite-wasm` (SQLite 3.54.1), además de los tests previos con `node:sqlite`.

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `lib/db/motor.ts` (nuevo) | `abrirMotor()` (singleton, `locateFile` en navegador), `abrirBaseLocal()` (kvvfs + esquema si vacía, guarda sin navegador), `aplicarEsquemaSiVacia()`, `ejecutarPlan()` (transacción con rollback) |
| `lib/db/__tests__/motor.test.ts` (nuevo) | 5 tests contra el motor real |
| `scripts/copy-sqlite-wasm.mjs` (nuevo) | copia `sqlite3.wasm` → `public/sqlite/` (879.084 bytes) |
| `package.json` | `postinstall`: `node scripts/copy-sqlite-wasm.mjs` |
| `.gitignore` | `public/sqlite/` (artefacto de `node_modules`) |
| `docs/decisions/0012-backend-kvvfs-localstorage.md` (nuevo) | ADR-0012 |
| `docs/decisions/README.md` | fila 0012; estado de 0011 anotado |
| `docs/decisions/0011-...md` | solo línea de Estado (backend → ADR-0012) |
| `db/README.md` | conteos de tests (…+ motor 5), estado del motor, "Falta" actualizado |
| `README.md` | stack (sqlite-wasm), conteos 164/30, nota postinstall, estado |

### Qué se probó y cómo (comando + resultado)

- `npm run typecheck` → **sin errores**.
- `npm test` → **164 passed (164), 30 archivos** (antes: 159/29; +5 del motor).
- `npx vitest run lib/db/__tests__/motor.test.ts` → 5/5: singleton+versión; esquema (25 tablas + 2 vistas, `integrity_check = ok`, `schema_version = 0.1.0`, idempotente); migración completa con paridad de totales/presupuestos; rollback ante paso inválido; `abrirBaseLocal` rechaza fuera de navegador.
- `node scripts/copy-sqlite-wasm.mjs` → `OK sqlite3.wasm -> public/sqlite/sqlite3.wasm (879084 bytes)`.
- Pruebas manuales del paquete en Node (sesión): `init()` → SQLite 3.54.1; `oo1.DB(':memory:')` opera; `locateFile` con ruta mala → ENOENT (documentado en `motor.ts`).
- Nota: la corrección de "26 vs 25 tablas" fue por `sqlite_sequence` (interna, AUTOINCREMENT); el test ahora excluye `sqlite_%`.

### Errores pendientes y decisiones que requieren validación humana

- **Prueba manual en navegador pendiente** (no hay navegador en este entorno, AGENTS §15): kvvfs en `localStorage`, carga del wasm vía `locateFile`, copia del wasm en `next dev` y en build `export`.
- **Paso 3 (cableado UI)**: conectar `components/gastos/gestor-gastos.tsx` a `abrirBaseLocal()` + migración `moneya:gastos:v1` → tablas al primer uso, y capturar `QuotaExceededError`.
- Bug conocido y no abordado en esta tarea (diferido por decisión del usuario): `lib/formato/moneda.ts:22` usa `maximumFractionDigits: 0` → montos PEN sin decimales.
- ADR pendiente si el hosting cambia (OPFS requeriría otro hosting → nuevo ADR).

### Siguiente paso

**Paso 3 del adapter:** cablear la UI de gastos a `lib/db/motor.ts` (lectura/escritura sobre tablas + migración con marcador `migracion_gastos_v1`), con tests de las partes puras y prueba manual en navegador declarada.
