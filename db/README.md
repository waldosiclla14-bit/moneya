# `db/` — esquema maestro y muestra

Todo el modelo de datos relacional vive aquí (decisión **ADR-0011**; backend de almacenamiento local: **ADR-0012**, kvvfs sobre `localStorage`).

| Archivo | Qué es |
|---|---|
| `moneya_schema.sql` | Esquema maestro v0.1.0 (SQLite). Copia exacta del archivo entregado por Waldosiclla (2026-10-20). Tablas, vistas (`v_tx_effective`, `v_account_balance`) y las consultas Q1–Q5 documentadas como comentarios. |
| `muestra.sql` | Dataset de demostración. **100 % ficticio**: personas, negocios y montos inventados para probar el esquema. Ventana: 2026-10-01 a 2026-10-31, "hoy" = 2026-10-20, CLP. |
| `consultas-muestra.sql` | Q1–Q5 con parámetros (`:ledger :from :to :today`), versiones ejecutables de lo documentado en el esquema. |

## Cómo verificar (todo corre en CI)

```bash
npm test            # lib/db/__tests__/: muestra (11) + esquema (3) + migración (9) + motor (5) + gastos-repo (10)
npm run muestra     # esquema + muestra en SQLite en memoria: Q1–Q5 y salud del esquema
npm run gen:esquema # regenera lib/db/esquema.ts (SQL inyectado en el bundle)
```

Verificado el 2026-10-20: `integrity_check = ok`, `foreign_key_check = 0`, `meta.schema_version = 0.1.0`, 34 transacciones y Q1 = 1.460.320 CLP libres — [verificado].

## Estado al 2026-10-20

- **Esquema:** v0.1.0, carga sin errores de integridad ni claves foráneas.
- **SQL inyectado:** `lib/db/esquema.ts` se genera desde este archivo; un test falla si derivan (nunca editar a mano).
- **Migración localStorage → tablas:** `lib/db/migracion.ts` planifica la migración del estado de gastos (`moneya:gastos:v1`) de forma determinista y validada (fechas, montos, categorías). Probada contra el esquema real: totales, presupuestos, idempotencia, y que **no inventa saldo** (la cuenta migrada queda con `include_in_safe_to_spend = 0` porque este módulo no modela ingresos; `v_account_balance` de esa cuenta = −gastos migrados y "libre hoy" (Q1) = 0).
- **Poblado por la muestra:** 2 libros (personal y negocio), 6 cuentas, 21 categorías, 2 metas, 1 deuda, 5 presupuestos, 5 reglas recurrentes, 34 transacciones, 1 captura IA con 4 ítems de recibo.
- **Vacío a propósito (regla de no-invención, garantizada por test):**
  - `tax_regimes`, `document_types`, `formalization_steps` → solo con fuente oficial + fecha de consulta (`docs/emprede/FORMALIZATION_*.md`).
  - `exchange_rates` → sin tipo de cambio verificado.
- **Semillas provisionales** en `institutions`: nombres de bancos/billeteras de Chile y Perú; el propio esquema los marca *"revisar antes de publicar"*.
- **Motor de ejecución (ADR-0012):** `@sqlite.org/sqlite-wasm` instalado; `lib/db/motor.ts` inicializa el motor (singleton), aplica el esquema a una base vacía y ejecuta planes en transacción. Verificado en CI contra el motor real (build `node`): esquema (25 tablas + 2 vistas, `integrity_check = ok`), migración completa y rollback ante error. El wasm se sirve desde `public/sqlite/sqlite3.wasm` (copia de `postinstall`).
- **Repositorio de gastos (UI conectada, 2026-10-20):** `lib/db/gastos-repo.ts` es la fachada que usa `components/gastos/gestor-gastos.tsx`. Primera apertura → migra `moneya:gastos:v1` → tablas si falta `meta['migracion_gastos_v1']` (país del perfil Supabase si hay sesión); después cada operación valida con los reducers de `lib/gastos/modelo.ts`, escribe en SQL (unidades mínimas enteras) y re-hidrata desde la base. En entornos sin kvvfs (jsdom/Node, `ErrorSinKvvfs`) cae a `crearRepositorioLocal()` (mismo contrato sobre localStorage legado). Paridad con `v_tx_effective`, decimales CLP/PEN, soft-delete y presupuestos probados en CI (10 tests).
- **Falta:** probar en navegador real (kvvfs en `localStorage`, carga del wasm vía `locateFile`, captura de `QuotaExceededError` — no ejecutable en CI); y documentado como pendiente: si el perfil falla al cargar, el libro se crea con el país del contexto, y un cambio de país posterior no re-migra ni reescribe la moneda del libro.

## Reglas al editar

1. El esquema es la única fuente de tablas; no crear tablas en otro lado.
2. Si cambias Q1–Q5 en el esquema, actualiza también `consultas-muestra.sql` (el test de deriva falla si divergen).
3. Nunca insertar datos reales de personas ni credenciales/identificadores tributarios completos.
4. Toda cifra de la muestra se etiqueta como ficticia; ningún dato de esta carpeta puede citarse como evidencia.
