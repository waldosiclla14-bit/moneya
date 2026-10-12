# ADR-0003. Motor financiero determinista; la IA explica, no calcula

- Estado: Aceptado
- Fecha: 2026-10-12
- Contexto:
  - AGENTS.md §9 exige que la IA **explique, no calcule ni invente cifras**, y que las reglas financieras sean centralizadas y testeables.
  - El proyecto ya separa la lógica financiera en `lib/` (`calculos/`, `cfpb/`, `datos/`, `misiones/`), con pruebas unitarias verdes.
  - Los cálculos alimentan decisiones sensibles (liquidez, cuotas, riesgo de sobreendeudamiento), donde un error tiene impacto real (AGENTS.md §2.17).
- Decisión: Toda cifra mostrada al usuario proviene de **funciones deterministas y testeadas** en `lib/` (TypeScript puro, sin red ni IA). Ningún resultado numérico se genera con un modelo de lenguaje; un LLM, si se usa, solo redacta/explica a partir de números ya calculados.
- Alternativas consideradas:
  - **Cálculo con LLM:** descartado (alucinación de cifras, no testeable, riesgo financiero).
  - **Cálculo en el servidor:** innecesario para el MVP (cálculo client-side determinista y verificable); se reevaluaría si hubiera datos sensibles server-side.
- Consecuencias:
  - Positivas: resultados reproducibles y testeables (92 tests); auditoría sencilla; sin costos de IA en el núcleo.
  - Negativas / pendientes: cada nueva métrica exige fórmula documentada + tests; el texto generado (cuando exista IA) debe leer las cifras del motor, nunca re-calcularlas.
- Referencias: `lib/calculos/`, `lib/cfpb/`, `docs/audit/FEATURE_INVENTORY.md` §3.1, AGENTS.md §9.
