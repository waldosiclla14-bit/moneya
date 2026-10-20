# Estado de MONEYA — log de sesión

Protocolo: AGENTS.md §2.5. Cada sesión cierra con decisiones, archivos, verificación y siguiente paso.

---

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
