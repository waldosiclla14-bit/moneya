# Segmento inicial y métricas — propuesta pendiente de revisión

Fecha: 2026-10-13 · Estado: **propuesta, sin aprobar** (O5 sigue abierto hasta decisión del dueño).
Fuentes: PRD V2 §4/§13/§18, AGENTS §8/§13. Sin cifras inventadas ni metas numéricas (no hay línea base).

## 1. Segmento inicial propuesto: A + B

- **A. Ingreso estable, poco ahorro** (presupuesto, calendario, metas) + **B. Ingreso variable** (escenarios, previsión de liquidez) — AGENTS §8.
- Calza con el usuario V1 del PRD §4: adulto urbano 25–40, ingreso formal o mixto, Chile/Perú, ya usa app u hoja de cálculo, busca entender patrones — [supuesto del doc, pendiente de entrevistas].
- **No V1:** C (varias deudas: requiere inventario + simulador avanzado ya parcialmente cubierto, pero sin validación de uso), D (déficit estructural: exige red de apoyo y revisión legal antes de prometer nada), E (independientes/comerciantes: es territorio Emprende, módulo aparte).
- Criterio de corte [opinión]: A+B usan lo ya construido (foto, simulador, CFPB); C/D/E piden contenido, red de apoyo o integraciones que hoy no existen.

## 2. Métricas (definidas antes del piloto)

- **Norte:** retención — re visita a los 7 días (PRD §18).
- **Activación:** onboarding + test CFPB completado + ≥1 simulación guardada (PRD §18).
- **Hecho clave:** ≥2 de las 5 misiones completadas (PRD §18).
- **Cobertura de eventos hoy [verificado]:** `onboarding_completed`, `test_completed`, `profile_saved`, `simulation_created`, `mission_completed` se emiten y están fijados por `EVENTOS_PERMITIDOS` + tests. Falta instrumentar: timestamp de primera/última visita para la ventana de 7 días (hoy no se mide retención) y métricas de protección AGENTS §13 (recorte dañino de esenciales, deuda por malinterpretar simulación, errores de cálculo, estrés/verguenza) — sin instrumento no hay piloto que las afirme.
- **Reglas:** ventanas y denominadores explícitos por métrica; sin metas numéricas hasta tener línea base; sin atribuir causalidad a antes-después sin grupo de comparación (AGENTS §13).

## 3. Qué falta para aprobar

1. Dueño elige segmento (A+B u otro) — decisión O5.
2. 8–10 entrevistas CL/PE (PRD §18 Fase 0) que confirmen o refuten el supuesto §4.
3. Instrumentar ventana de retención + decidir qué señales de protección son medibles sin invadir privacidad.
