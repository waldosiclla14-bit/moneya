# Backlog de adopción — PRD V2

Fecha: 2026-10-13 · Origen: ADR-0008. Solo brechas y pendientes; lo ya alineado no se lista (ver ADR-0008).

## Ya alineado [verificado] (no acciona)
CFPB 10 ítems + tramos de edad · métricas separadas · 4 indicadores LATAM · Supabase/RLS + seeds · motor determinista + fórmulas visibles · telemetría privada · 5 misiones · lenguaje sin culpa/garantías · estructura de carpetas §20 · dashboard FREE ("Tu foto de hoy").

## Brechas

### B1. Scoring CFPB: score único + desglose descriptivo — **VERIFICADO (2026-10-13)**
- `lib/cfpb/scoring.ts`: `scoreCFPB` mapea el total 0–40 por tabla según tramo (`18_61`/`62_plus`), rechaza totales fuera de rango; `validarRespuestas` exige los 10 ítems (sin omisiones) con enteros 0–4; `desgloseDimensiones` es promedio codificado ÷4×100 con fórmula e ítems listados; `NOTE_RESULTADO` declara que el desglose es descriptivo, no psicométrico por eje — [verificado].
- `components/wellbeing/wellbeing-test.tsx`: muestra "Tu puntaje CFPB {score} / 100" + nota, 4 tarjetas descriptivas con "Ver fórmula e ítems", y selector de tramo con aviso de tabla oficial — [verificado]. Sin fix.

### B2. 10 preguntas conductuales exploratorias — **VERIFICADO (2026-10-13)**
- Existen: `lib/perfil/exploratorias.ts` con 10 preguntas (`PREGUNTAS_EXPLORATORIAS`) — [verificado].
- Etiquetado: `wellbeing-test.tsx` las muestra bajo "Tus hábitos de dinero · exploratorio" con el texto "No generan puntaje: son exploratorias y no están validadas científicamente como la escala CFPB" — [verificado]. Sin fix.

### B3. Biblioteca: originalidad vs. Housel — pendiente de revisar
- Qué: revisar los ~10 seeds (`0003_seed_lessons.sql` + `components/aprender/library.tsx`): redacción 100% original, sin resúmenes que repliquen estructura protegida (PRD §8).
- Aceptación: revisión línea por línea registrada; reescritura de lo que replique.

### B4. Eventos de activación/retención — emisión no verificada
- Qué: confirmar que se emiten `test_completed`, `simulation_created`, `mission_completed` (además de `onboarding_completed`/`profile_saved`, ya vistos) y que ninguno lleva valores financieros (PRD §18 + regla 7).
- Aceptación: grep + test que fije el set de eventos permitido.
- Pista (2026-10-13): `wellbeing-test.tsx` ya emite `test_completed` al guardar; `perfil-form.tsx` emite `onboarding_completed` + `profile_saved` — [verificado]. Falta confirmar `simulation_created` y `mission_completed`.

### B5. Revisión legal Chile/Perú — pendiente externo
- Qué: CMF/SBS (¿cobertura/liquidez = asesoría regulada?), datos personales, disclaimers del test CFPB (PRD §14). Requiere abogado; el disclaimer actual es provisional.
- Aceptación: concepto legal archivado con fecha; sin esto no hay lanzamiento.

### B6. Datos de mercado §5 — supuestos del doc
- Qué: cifras Principal/CEBR y citas de prensa aportadas por el PRD; no verificadas en sesión. No usarlas en UI ni decisiones hasta verificar fuente primaria.
- Aceptación: registro en `docs/` con URL, fecha de consulta y extracto, o retiro de la afirmación.
