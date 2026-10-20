# `db/` — esquema maestro y muestra

Todo el modelo de datos relacional vive aquí (decisión **ADR-0011**).

| Archivo | Qué es |
|---|---|
| `moneya_schema.sql` | Esquema maestro v0.1.0 (SQLite). Copia exacta del archivo entregado por Waldosiclla (2026-10-20). Tablas, vistas (`v_tx_effective`, `v_account_balance`) y las consultas Q1–Q5 documentadas como comentarios. |
| `muestra.sql` | Dataset de demostración. **100 % ficticio**: personas, negocios y montos inventados para probar el esquema. Ventana: 2026-10-01 a 2026-10-31, "hoy" = 2026-10-20, CLP. |
| `consultas-muestra.sql` | Q1–Q5 con parámetros (`:ledger :from :to :today`), versiones ejecutables de lo documentado en el esquema. |

## Cómo verificar (ambos corren en CI)

```bash
npm test          # lib/db/__tests__/muestra.test.ts (11 tests)
npm run muestra   # carga esquema + muestra en SQLite en memoria e imprime Q1–Q5 y la salud del esquema
```

Verificado el 2026-10-20: `integrity_check = ok`, `foreign_key_check = 0`, `meta.schema_version = 0.1.0`, 34 transacciones y Q1 = 1.460.320 CLP libres — [verificado].

## Estado al 2026-10-20

- **Esquema:** v0.1.0, carga sin errores de integridad ni claves foráneas.
- **Poblado por la muestra:** 2 libros (personal y negocio), 6 cuentas, 21 categorías, 2 metas, 1 deuda, 5 presupuestos, 5 reglas recurrentes, 34 transacciones, 1 captura IA con 4 ítems de recibo.
- **Vacío a propósito (regla de no-invención, garantizada por test):**
  - `tax_regimes`, `document_types`, `formalization_steps` → solo con fuente oficial + fecha de consulta (`docs/emprede/FORMALIZATION_*.md`).
  - `exchange_rates` → sin tipo de cambio verificado.
- **Semillas provisionales** en `institutions`: nombres de bancos/billeteras de Chile y Perú; el propio esquema los marca *"revisar antes de publicar"*.
- **No integrado:** la app no lee ni escribe este esquema todavía (el gestor de gastos usa `lib/gastos/modelo.ts` sobre `localStorage`). Falta el adapter `sqlite-wasm + OPFS` y el plan de migración de datos locales.

## Reglas al editar

1. El esquema es la única fuente de tablas; no crear tablas en otro lado.
2. Si cambias Q1–Q5 en el esquema, actualiza también `consultas-muestra.sql` (el test de deriva falla si divergen).
3. Nunca insertar datos reales de personas ni credenciales/identificadores tributarios completos.
4. Toda cifra de la muestra se etiqueta como ficticia; ningún dato de esta carpeta puede citarse como evidencia.
