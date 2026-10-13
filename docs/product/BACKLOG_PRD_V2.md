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

### B3. Biblioteca: originalidad vs. Housel — **VERIFICADO (2026-10-13)**
- Revisión línea por línea de `supabase/migrations/0003_seed_lessons.sql` (10 artículos): títulos propios en español (ningún título de capítulo del libro), prosa original con voz LATAM (refrigerador, colegio, vitrina, peso), ideas a nivel de concepto atadas a métricas de la app (meses de cobertura, margen), cero citas verbales, cero menciones al autor/libro, cero cifras inventadas (todo cualitativo) — [verificado].
- Paridad semilla↔app: los mismos 10 slugs y cuerpos en `lib/aprender/data/*.ts` (spot-check `room-for-error` OK); `library.tsx` no menciona la fuente externa — [verificado].
- Observación [opinión]: el título "La riqueza es lo que no ves" traduce un título de capítulo; los títulos/frases cortas no son protegibles y no hay réplica de estructura (10 lecciones en 5 ejes PRD vs. 20 capítulos), así que no se reescribe. Si se quiere máxima cautela, renombrar es un follow-up menor (requiere nueva migración, no editar la 0003 aplicada).

### B4. Eventos de activación/retención — **RESUELTO (2026-10-13)**
- Los 5 eventos emitidos (`onboarding_completed`, `test_completed`, `profile_saved` en perfil/bienestar; `simulation_created` en simulador; `mission_completed` en misiones) coinciden exactamente con el enum `public.event_name` de la migración 0001; ningún call site envía `properties` con valores — [verificado].
- **Fix aplicado:** `EVENTOS_PERMITIDOS` exportado en `lib/supabase/events-repo.ts` (espejo del enum; la DB sigue siendo la barrera final); `registrarEvento` rechaza nombres fuera del set antes de tocar la DB; re-exportado en `lib/supabase/index.ts`. Tests: set exacto + acepta permitido + rechaza desconocido sin insertar (9 tests en `events-repo.test.ts`).

### B5. Revisión legal Chile/Perú — pendiente externo
- Qué: CMF/SBS (¿cobertura/liquidez = asesoría regulada?), datos personales, disclaimers del test CFPB (PRD §14). Requiere abogado; el disclaimer actual es provisional.
- Aceptación: concepto legal archivado con fecha; sin esto no hay lanzamiento.

### B6. Datos de mercado §5 — **PARCIALMENTE VERIFICADO (2026-10-13)**
- ✅ LATAM 44,7 (+0,1): informe Global Financial Inclusion Index 2025 — "LATIN AMERICA 44.6 → 44.7 (+0.1)". Fuente: `https://ent.news/2025/10/1159.pdf` (réplica del informe Enterprise), consultado 2026-10-13.
- ✅ Perú/Brasil/Colombia en el bottom 10 global: mismo informe — "Six of the bottom 10… (Brazil, Colombia, Peru, Kenya, Nigeria, Ghana)". Misma fuente y fecha.
- ✅ Brasil entre los que más mejoran (junto a Argentina, Corea del Sur, Tailandia, Singapur): comunicado Principal 20-10-2025 (`https://investors.principal.com/node/36826/pdf`), consultado 2026-10-13. El matiz "gracias a Pix" queda como [supuesto del doc] (el informe cita pagos instantáneos/open banking como motor, sin nombrar Pix en el extracto).
- ❌ Caída de 8,8 puntos en percepción (cita elporvenir.mx, oct-2025): **no encontrada en dos búsquedas dirigidas (2026-10-13) → no verificado, revisar a mano**. No usar esa cifra en UI ni narrativa hasta verificarla.
- ➕ Segunda fuente hallada: Credicorp IIF 2024 — región 38,2→47,6 (4 años de mejora), Chile 58,3 / Perú 46,1. Fuente: `https://grupocredicorp.com/en/for-four-consecutive-years-latin-america-has-improved-its-level-of-financial-inclusion`, consultado 2026-10-13.
