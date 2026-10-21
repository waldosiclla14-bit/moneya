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
7. **El literal del paquete sqlite-wasm vive solo en `vitest.setup.ts`; en navegador el ESM se sirve fuera del bundle.** Tres intentos verificados en CI/CI local (2026-10-20): (a) `fc03c46` (run 39501321016) con import literal en `motor.ts` → Turbopack siguió `gestor-gastos.tsx → motor.ts → dist/index.mjs → new Worker(new URL("sqlite3-worker1.mjs"))` y al analizar `sqlite3-worker1.mjs` chocó con `new Worker(new URL(proxyUri, …))` de opfsUtil → `Error: Module not found: Can't resolve <dynamic>` (security ✓ en ese run); (b) `576345e` (run 39502260266) con `import(modulo)` de destino dinámico → Turbopack **también** falla con `<dynamic>` (error duro, no warning); (c) `new Function('ruta', 'return import(ruta)')` evita el análisis del bundler, pero **Node/V8 rechaza `import()` dentro de `new Function`** (`TypeError: A dynamic import callback was not specified`, 12 tests locales). **Solución final:** el cargador es inyectable — `usarCargadorSqlite()`; el setup de vitest (fuera del grafo de Next) inyecta `() => import('@sqlite.org/sqlite-wasm')`, y en navegador real sin inyección `cargarMotor()` construye el import con `new Function` hacia `public/sqlite/index.mjs` (requisito: no enviar CSP con `unsafe-eval`; GitHub Pages no envía cabeceras — ADR-0001). `copy-sqlite-wasm.mjs` copia `index.mjs`, `sqlite3-worker1.mjs` y `sqlite3.wasm` a `public/sqlite/`. El build queda por verificar en CI (no ejecutable en local por RAM, AGENTS §15); la mecánica en Node quedó verificada con los 174 tests.

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `lib/db/gastos-repo.ts` (nuevo) | `RepositorioGastos` (leer/guardar/quitar/crear categoría/presupuesto), `abrirRepositorioGastos(ctx)` (abre + migra si falta marcador), `crearRepositorio(db)` (SQL), `crearRepositorioLocal()` (legado), `tzDelDispositivo()` |
| `lib/db/__tests__/gastos-repo.test.ts` (nuevo) | 10 tests: fallback sin kvvfs, round-trip migración→hidratación (`toEqual`), decimales PEN/CLP y rechazo de montos que redondean a 0, categoría desconocida sin escritura, soft-delete, sort_order y duplicados de categorías, presupuestos (upsert/update/0→borrar→recrear), paridad con `v_tx_effective`, formato de tz |
| `lib/db/motor.ts` | `ErrorSinKvvfs`, `esNavegadorReal()` (jsdom excluido de locateFile/guard kvvfs), cargador inyectable (`usarCargadorSqlite`) + `new Function` hacia `public/sqlite/index.mjs` en navegador |
| `vitest.setup.ts` (nuevo) | inyecta `() => import('@sqlite.org/sqlite-wasm')` para todos los tests (único lugar con el literal, fuera del grafo de Next) |
| `vitest.config.ts` | `setupFiles: ['./vitest.setup.ts']` |
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
- CI run 39501321016 (push `fc03c46`) → **build falló** (Turbopack, `sqlite3-worker1.mjs:15864 Can't resolve <dynamic>`); typecheck ✓ y security ✓.
- CI run 39502260266 (push `576345e`, fix con import por expresión) → **build falló otra vez** (Turbopack, `motor.ts:70 Can't resolve <dynamic>`); security ✓.
- `new Function` + `import()` → **falló 12 tests en Node** (`A dynamic import callback was not specified`); tras la solución de inyección → **typecheck sin errores y 174 passed (174), 31 archivos**. Grep: el literal solo aparece en `vitest.setup.ts` y en `import type`/comentarios.
- Sonda de `rowid` en sesión: desde la vista → `no such column: rowid`; desde la tabla → OK (documentado en el código).
- Prueba scratch en jsdom (sesión): carga el build `node` (`libVersion 3.54.1`, `JsStorageDb` ausente); con `locateFile` → ENOENT (origen del cambio `esNavegadorReal`).
- Tests del componente `gestor-gastos` (jsdom, 4) → pasan con el fallback local, incluida la aserción de persistencia legada.

### Errores pendientes y decisiones que requieren validación humana

- **Prueba manual en navegador pendiente** (AGENTS §15): primer uso con kvvfs (migración real desde localStorage), persistencia entre recargas, `QuotaExceededError` (5 MiB), carga del wasm con `locateFile` en `next dev` y en build `export`, y que GitHub Pages sirva `index.mjs`/`sqlite3-worker1.mjs` con MIME de JavaScript (los módulos nativos lo exigen).
- **Build de Turbopack:** pendiente de confirmar en el siguiente run de CI (no ejecutable en local por RAM); el `new Function` es string, no analizable. Si aun así fallara, alternativa: `turbopack.resolveAlias` de `dist/sqlite3-worker1.mjs` a un stub.
- **CSP:** el `new Function` exige no enviar cabecera `Content-Security-Policy` con `unsafe-eval`; GitHub Pages no envía CSP (ADR-0001). Si se añade CSP (proxy propio), revisar el cargador.
- **País:** si `obtenerPerfil` falla por red, el libro se crea con el país del contexto (posible CL vs PE); un cambio de país **posterior** a la migración no re-migra ni cambia la moneda del libro (el marcador lo impide) — decisión de diseño pendiente.
- I/O síncrono de kvvfs en hilo principal (rendimiento con volúmenes grandes) sin medir.
- Bug conocido y no abordado (diferido por decisión del usuario): `lib/formato/moneda.ts:22` → `maximumFractionDigits: 0` (montos PEN sin decimales).
- ADR pendiente si el hosting cambia (OPFS requeriría otro hosting → nuevo ADR).

### Siguiente paso

**Prueba manual en navegador del Paso 3** (checklist arriba) y, con eso verde, definir con Waldosiclla el siguiente bloque (sync/backend diferido O1, o siguiente pantalla del MVP).

---

## 2026-10-20 · Paso 3 (cierre): el runtime de sqlite no llegaba al artefacto desplegado

El build de CI quedó verde (`4b85273`, run 39503503103), pero al revisar el artefacto se encontró un hueco **distinto del bug de Turbopack**:

### Decisiones tomadas y por qué

1. **`public/sqlite/` nunca estuvo commiteado** (está en `.gitignore`) y en el primer checkout de la sesión `out/` no existía, así que la verificación "build verde" **no probó** que `/sqlite/index.mjs|sqlite3-worker1.mjs|sqlite3.wasm` existiera en el artefacto. Con `basePath: /moneya` y `output: export`, el módulo se carga con `import('/moneya/sqlite/index.mjs')`; si ese archivo no está en `out/`, el import da 404 y `abrirRepositorioGastos` cae al respaldo localStorage **en silencio** (kvvfs nunca activo). Es el mismo tipo de fallo que el banner de error buscaba evitar, pero en la ruta del artefacto, no del código.
2. **Dos redes, no una:** `copy-sqlite-wasm.mjs` ahora copia a `public/sqlite/` y, si `out/` existe, también a `out/sqlite/`. El postinstall omite `out/` (`NEXT_SKIP_SQLITE_OUT=1`, vía `node -e`) para no dejar un `out/` obsoleto en artifacts/CI; en CI, tras `npm run build`, un paso `npm run sqlite:out` **refresca `out/sqlite/`** y otro paso **verifica que los 3 archivos existan** antes de subir el artefacto. Si algún día el volcado de `public/` con `basePath` fallara, el deploy no se sube en silencio: el job falla.
3. **`.gitignore`:** se añadió `out/sqlite/` explícito (aunque `out/` ya estaba) y se corrigió el comentario, que aún describía solo `sqlite3.wasm`.

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `scripts/copy-sqlite-wasm.mjs` | copia a `public/sqlite/` y a `out/sqlite/` si `out/` existe; omite `out/` con `NEXT_SKIP_SQLITE_OUT=1`; log con ruta relativa |
| `package.json` | `postinstall` fija `NEXT_SKIP_SQLITE_OUT=1`; nuevo `sqlite:out` (copia con `out/` si existe) |
| `.github/workflows/gh-pages.yml` | tras el build: `npm run sqlite:out` + paso que verifica `out/sqlite/{index.mjs,sqlite3-worker1.mjs,sqlite3.wasm}` |
| `.gitignore` | `out/sqlite/` explícito + comentario corregido |
| `README.md` | fila `sqlite:out` y nota de postinstall/build |
| `docs/estado.md` | esta entrada |

### Qué se probó y cómo (comando + resultado)

- `node scripts/copy-sqlite-wasm.mjs` (sin `out/`) → 3 archivos a `public/sqlite/` (656.872 + 650.116 + 879.084 bytes).
- `npm run postinstall` → solo `public/sqlite/` (no crea `out/`).
- Con `out/` presente → copia a `public/sqlite/` y a `out/sqlite/`; verificado con `Get-ChildItem out/sqlite` (3 archivos).
- `npm run typecheck` → sin errores; `npx vitest run` → **174 passed (174), 31 archivos**.
- `git check-ignore -v out/sqlite/index.mjs` → cubierto por `.gitignore` (sin residuo en el repo). `out/` de prueba eliminado tras verificar.

### Errores pendientes y decisiones que requieren validación humana

- **El chequeo del artefacto es de existencia, no de carga.** Solo la prueba manual en navegador (o un humo automatizado con Playwright, descartado por tamaño) confirma MIME correcto de `.mjs` y carga del wasm en Pages. Sigue pendiente.
- Sigue pendiente todo lo declarado en la entrada del Paso 3 (carrera de país, `QuotaExceededError`, kvvfs real).
- **No verifiqué en CI** el paso nuevo hasta el próximo push.

### Siguiente paso

Push y `gh run watch` para confirmar el paso de verificación del artefacto; después, prueba manual en navegador del Paso 3.

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

---

## Checklist · Prueba manual en navegador (Paso 3) — pendiente de ejecutar

Objetivo: cubrir lo que CI no puede (MIME de `.mjs`, kvvfs real, cuota). Marcar cada casilla con la evidencia observada.

### Preparación
- [ ] Abrir la app desplegada (`https://<usuario>.github.io/moneya/`) o local (`npm run dev`).
- [ ] DevTools (F12) → pestañas **Console** y **Network** abiertas; Network filtrado por `sqlite`.
- [ ] Recargar y confirmar que la app renderiza sin errores rojos en Consola.

### 1. El runtime de sqlite se sirve bien (MIME + 200)
- [ ] `GET /moneya/sqlite/index.mjs` → **200** (en local sin `/moneya`).
- [ ] `GET /moneya/sqlite/sqlite3.wasm` → **200**.
- [ ] `content-type` de `index.mjs` es `text/javascript` o `application/javascript` (si es `text/plain`/`application/octet-stream` → **FALLA**, el import nativo se rechaza).
- [ ] Consola sin error de import/404 de `sqlite`.

### 2. Migración y persistencia (base = verdad)
- [ ] Antes de usar la pantalla: `localStorage.getItem('migracion_gastos_v1')` → `null`.
- [ ] Registrar un gasto en **Gastos** (categoría, monto, fecha) → guarda sin banner de error.
- [ ] `localStorage.getItem('migracion_gastos_v1')` → ya **no** es `null`.
- [ ] `localStorage.getItem('moneya:gastos:v1')` → **null o intacto** (el legado ya no se escribe).
- [ ] Recargar (F5): el gasto persiste y con los **mismos números**.

### 3. Cuota (`QuotaExceededError`) — 5 MiB
- [ ] Llenar `localStorage` (relleno de ~10 MiB) y registrar un gasto → aparece **banner de error**, sin crash ni pérdida silenciosa.
- [ ] Limpiar el relleno (`localStorage.removeItem('relleno'+i)`) y recargar.

### Resultado (a completar por Waldosiclla)
- Fecha · entorno (Pages / local) · navegador:
- Observaciones / fallos:

