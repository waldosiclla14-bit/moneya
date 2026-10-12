# Deuda técnica — MONEYA

Fecha: 2026-10-11 · Fase 0 (solo lectura) · Hallazgos **[verificado]** salvo que se marque otra etiqueta.

---

## TD-1. `tsconfig.tsbuildinfo` commiteado — [verificado] → **RESUELTO (2026-10-11)**
- El artefacto incremental de TypeScript quedaba versionado: ruido en diffs y potenciales conflictos.
- **Fix aplicado:** `*.tsbuildinfo` añadido a `.gitignore`; `git rm --cached tsconfig.tsbuildinfo`; `.gitattributes` fuerza LF en scripts/docs. Verificación: typecheck local en verde; el artefacto deja de trackearse.

## TD-2. Typecheck no ejecutado en CI — [verificado] → **RESUELTO (2026-10-11)**
- `package.json` expone `typecheck` (tsc --noEmit) pero `.github/workflows/gh-pages.yml` solo corría vitest + export build.
- **Fix aplicado:** paso `npm run typecheck` en el job `build` (gatea el deploy); nuevo job `security` (no bloquea) con `sh scripts/scan-secrets.sh` + `npm audit --audit-level=high`. Escáner probado localmente (evidencia: detecta probe con URL/JWT falsos, exit 1; limpio en repo, exit 0).

## TD-3. Sin tests de componentes UI — [verificado] → **RESUELTO (2026-10-12)**
- Vitest cubría solo `lib/**`; los componentes (login, FotoFinanciera, PerfilForm, SimuladorForm, GoalGrid…) no tenían tests de render/interacción.
- Riesgo: regresiones de UX/a11y pasaban CI.
- **Fix aplicado:** añadidos `@testing-library/react`, `@testing-library/dom` y `jsdom` (devDeps); `vitest.config.ts` amplía `include` a `{lib,components}/**/*.test.{ts,tsx}` (entorno por archivo: `// @vitest-environment jsdom`). Primer test: `components/home/__tests__/hero-demo.test.tsx` (render + recálculo del simulador héroe). Local **86/86 (15 archivos)**. Prioridad siguiente: flujo registro → perfil → finanzas.
- **Limitación:** los tests de UI aún necesitan mocks de sesión/Supabase para los flujos con datos; por ahora se cubren componentes con lógica pura + `useRegion` por defecto.

## TD-4. Autenticación sin gateo de rutas — [verificado] + **[opinión]** riesgo alto
- No hay `middleware.ts`; los 6 componentes que usan `useSession` lo hacen cliente-side; no hay redirect server-side.
- En demo funciona (UX degradada) pero es inapropiado para producción real con datos financieros.
- **Fix (decisión de arquitectura):** ver PROJECT_AUDIT J1/J3 y OPEN_QUESTIONS. Opciones: middleware + `createServerClient` (aleja de `output: export`) o redirect client-side con un provider explícito.

## TD-5. Enfoque `supabase` mixto SSR/client — [verificado] + **[opinión]**
- Conviven `BrowserClient` y `createServerClient` (código en `lib/supabase/server.ts` lanza error si faltan envs). Con `output: export` el SSR no existe: `createServerClient` solo tendrá sentido si migramos a Vercel full; si nos quedamos en Pages, sobra y añade una vía de crash.
- **Fix:** decidir un solo camino (ver TD-4/J1). Costo bajo, dependiente de J1.

## TD-6. Moneda/locale hardcodeado es-CL — [verificado] + **[opinión]** gap regional → **RESUELTO (2026-10-12)**
- `FotoFinanciera`, `hero-demo`, `metric-card`, `count-up` y la fecha de `simulador-form` formateaban con `es-CL` fijo; un usuario peruano veía formato chileno.
- **Fix aplicado:** módulo único `lib/formato/moneda.ts` (fuente única `PAISES`, `PAIS_DEFAULT = 'CL'`), `lib/formato/region.tsx` (`RegionProvider` + `useRegion()`) que resuelve el país desde el perfil (`obtenerPerfil`, nuevo en `onboarding-repo`) con sesión y cae a Chile en demo. Refactorizados los 5 puntos de uso. Verificado que la diferencia es visible: CL `1.234.567` / decimal `,`; PE `1,234,567` / decimal `.` (tests en `lib/formato/__tests__/moneda.test.ts`).
- **Limitación:** sin UI de cambio manual de región; en demo (sin sesión) siempre Chile.

## TD-7. Sin README ni `docs/` — [verificado] → **PARCIAL (2026-10-12)**
- `README.md` creado (arranque: env, Supabase, deploy, PWA) y `docs/audit` completo. Pendiente: `docs/decisions` (ADRs) para las decisiones de arquitectura (§11).
- **Fix pendiente:** crear `docs/decisions/` con ADRs de las decisiones J1/O2/O3. Costo bajo–medio.

## TD-8. `mission_progress` sin política de borrado — [verificado] → **RESUELTO (2026-10-12)**
- 0005 añade políticas `delete` para `profiles` y `events` (derecho al olvido) pero **no** para `mission_progress`; el export/delete del usuario deja basura dependiente.
- **Fix aplicado:** migración `0006_mission_progress_delete_privacy.sql` (`mission_progress_delete_own`, owner) y bloque equivalente anexado a `supabase/setup-all-in-one.sql`. Cierra el gap: sin esta política, el DELETE de `mission_progress` en `eliminarDatosUsuario` era bloqueado por RLS (borrado silencioso). **Requiere aplicar la migración en el proyecto Supabase** (bloqueado por O1).

## TD-9. `events.properties` validado solo en app — [verificado] + **[opinión]** bajo
- La regla «no subir valores financieros a properties» se aplica en la capa de app; la DB no la fuerza (supabase-js `properties` es `jsonb` libre).
- **Fix (opcional):** trigger/check en migración o validación en el repo. No bloqueante para demo.

## TD-10. Valores nulos de indicadores LATAM — [verificado] + **[opinión]**
- `lib/datos` tiene `null`s (p. ej. tasas no disponibles para AR); el componente los omite. Riesgo: si en el futuro se exige más exactitud, hay que decidir si delegar a valores oficiales futuros o mantener `null` honesto.

## Prioridad sugerida
1. TD-1 + TD-2 (higiene, hoy mismo).
2. TD-4/TD-5 (junto a la decisión J1 de arquitectura).
3. TD-6/TD-8 (rápidos, impacto regional y legal).
4. TD-3 → resuelto (infra RTL/jsdom + primer test de componente).
5. TD-7/TD-9/TD-10 (mejoras continuas).