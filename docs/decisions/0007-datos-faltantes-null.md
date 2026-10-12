# ADR-0007. Datos faltantes se representan como `null` (nunca se inventan)

- Estado: Aceptado
- Fecha: 2026-10-12
- Contexto:
  - La demo de datos LATAM usa Global Findex 2025 (`lib/datos/indicadores.ts`). En esa edición faltan valores: Chile no publica ahorro formal, crédito formal ni fondos de emergencia; Perú no publica fondos de emergencia (quedan en blanco en el dataset oficial) — [verificado] (`docs/audit/FEATURE_INVENTORY.md`, `FUENTE.notes` en `lib/datos/indicadores.ts`).
  - AGENTS.md §2.1 prohíbe inventar cifras y §16/§15 exigen marcar lo no verificado; TD-10 pedía fijar la política (`docs/audit/TECHNICAL_DEBT.md`).
- Decisión:
  - Un dato no disponible se representa como `value: null` (con su `year`), nunca como `0`, promedio regional, ni estimación.
  - El consumidor (UI) muestra un marcador honesto —"En verificación"/"sin dato verificado"— y **no** dibuja números inventados.
  - Los conjuntos exactos de valores verificados y de `null` quedan fijados por pruebas (`lib/datos/__tests__/indicadores.test.ts`), de modo que solo se actualizan con una fuente oficial.
- Alternativas consideradas:
  - **Rellenar con 0 o con un promedio regional:** rechazado; contradice la regla de no inventar y puede inducir a error.
  - **Ocultar la fila del indicador faltante:** rechazado; oculta que el indicador existe y sesga la comparación entre países.
  - **Estimar con otra edición/año:** rechazado por ahora; mezclar años sin declararlo es engañoso.
- Consecuencias:
  - Positivas: transparencia y trazabilidad; el "hueco" visible es información legítima (el dato no está publicado).
  - Negativas / pendientes: la tabla se ve incompleta a propósito; al publicarse el dato oficial hay que actualizar `VALORES` y sus tests (no hay automatización de ingesta).
- Referencias: `lib/datos/indicadores.ts`, `lib/datos/__tests__/indicadores.test.ts`, `components/datos/contexto-latam.tsx`, `docs/audit/TECHNICAL_DEBT.md` (TD-10).
