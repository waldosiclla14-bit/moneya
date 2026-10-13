# Backlog de adopción — PRD V2

Fecha: 2026-10-13 · Origen: ADR-0008. Solo brechas y pendientes; lo ya alineado no se lista (ver ADR-0008).

## Ya alineado [verificado] (no acciona)
CFPB 10 ítems + tramos de edad · métricas separadas · 4 indicadores LATAM · Supabase/RLS + seeds · motor determinista + fórmulas visibles · telemetría privada · 5 misiones · lenguaje sin culpa/garantías · estructura de carpetas §20 · dashboard FREE ("Tu foto de hoy").

## Brechas

### B1. Scoring CFPB: score único + desglose descriptivo — pendiente de verificar
- Qué: confirmar que `lib/cfpb/scoring.ts` y la pantalla de resultado muestran score único 0–100 y las 4 dimensiones solo como lectura descriptiva, con tramo de edad correcto y sin ítems omitidos (PRD §9).
- Aceptación: lectura de `scoring.ts` + pantalla de resultado documentada; o fix acotado si diverge.

### B2. 10 preguntas conductuales exploratorias — pendiente de verificar
- Qué: confirmar si existen y si están etiquetadas explícitamente como exploratorias/no validadas (PRD §17.2).
- Aceptación: rutas de archivo citadas o ítem de construcción creado con criterio propio.

### B3. Biblioteca: originalidad vs. Housel — pendiente de revisar
- Qué: revisar los ~10 seeds (`0003_seed_lessons.sql` + `components/aprender/library.tsx`): redacción 100% original, sin resúmenes que repliquen estructura protegida (PRD §8).
- Aceptación: revisión línea por línea registrada; reescritura de lo que replique.

### B4. Eventos de activación/retención — emisión no verificada
- Qué: confirmar que se emiten `test_completed`, `simulation_created`, `mission_completed` (además de `onboarding_completed`/`profile_saved`, ya vistos) y que ninguno lleva valores financieros (PRD §18 + regla 7).
- Aceptación: grep + test que fije el set de eventos permitido.

### B5. Revisión legal Chile/Perú — pendiente externo
- Qué: CMF/SBS (¿cobertura/liquidez = asesoría regulada?), datos personales, disclaimers del test CFPB (PRD §14). Requiere abogado; el disclaimer actual es provisional.
- Aceptación: concepto legal archivado con fecha; sin esto no hay lanzamiento.

### B6. Datos de mercado §5 — supuestos del doc
- Qué: cifras Principal/CEBR y citas de prensa aportadas por el PRD; no verificadas en sesión. No usarlas en UI ni decisiones hasta verificar fuente primaria.
- Aceptación: registro en `docs/` con URL, fecha de consulta y extracto, o retiro de la afirmación.
