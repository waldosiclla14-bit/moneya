# Deuda técnica — MONEYA

Fecha: 2026-10-11 · Fase 0 (solo lectura) · Hallazgos **[verificado]** salvo que se marque otra etiqueta.

---

## TD-1. `tsconfig.tsbuildinfo` commiteado — [verificado] → **RESUELTO (2026-10-11)**
- El artefacto incremental de TypeScript quedaba versionado: ruido en diffs y potenciales conflictos.
- **Fix aplicado:** `*.tsbuildinfo` añadido a `.gitignore`; `git rm --cached tsconfig.tsbuildinfo`; `.gitattributes` fuerza LF en scripts/docs. Verificación: typecheck local en verde; el artefacto deja de trackearse.

## TD-2. Typecheck no ejecutado en CI — [verificado] → **RESUELTO (2026-10-11)**
- `package.json` expone `typecheck` (tsc --noEmit) pero `.github/workflows/gh-pages.yml` solo corría vitest + export build.
- **Fix aplicado:** paso `npm run typecheck` en el job `build` (gatea el deploy); nuevo job `security` (no bloquea) con `sh scripts/scan-secrets.sh` + `npm audit --audit-level=high`. Escáner probado localmente (evidencia: detecta probe con URL/JWT falsos, exit 1; limpio en repo, exit 0).

## TD-3. Sin tests de componentes UI — [verificado]
- Vitest cubre solo `lib/**`; los 16 componentes (login, FotoFinanciera, PerfilForm, SimuladorForm, GoalGrid…) no tienen tests de render/interacción.
- Riesgo: regresiones de UX/a11y pasan CI.
- **Fix (a medio plazo):** añadir React Testing Library con un script `test:ui` (jsdom), priorizando el flujo registro → perfil → finanzas. Costo medio.

## TD-4. Autenticación sin gateo de rutas — [verificado] + **[opinión]** riesgo alto
- No hay `middleware.ts`; los 6 componentes que usan `useSession` lo hacen cliente-side; no hay redirect server-side.
- En demo funciona (UX degradada) pero es inapropiado para producción real con datos financieros.
- **Fix (decisión de arquitectura):** ver PROJECT_AUDIT J1/J3 y OPEN_QUESTIONS. Opciones: middleware + `createServerClient` (aleja de `output: export`) o redirect client-side con un provider explícito.

## TD-5. Enfoque `supabase` mixto SSR/client — [verificado] + **[opinión]**
- Conviven `BrowserClient` y `createServerClient` (código en `lib/supabase/server.ts` lanza error si faltan envs). Con `output: export` el SSR no existe: `createServerClient` solo tendrá sentido si migramos a Vercel full; si nos quedamos en Pages, sobra y añade una vía de crash.
- **Fix:** decidir un solo camino (ver TD-4/J1). Costo bajo, dependiente de J1.

## TD-6. Moneda/locale hardcodeado es-CL — [verificado] + **[opinión]** gap regional
- `FotoFinanciera` formatea montos con `Intl.NumberFormat('es-CL', …)` sin leer la región del perfil. Un usuario argentino/peruano ve formato chileno.
- **Fix:** mapear moneda por `country_id` (es-AR/ARS, es-CL/CLP, es-PE/PEN) con fallback es-CL. Ver decisión J4. Costo bajo.

## TD-7. Sin README ni `docs/` — [verificado]
- No existe `README.md`; la carpeta `docs/` se creó en esta Fase 0 (docs/audit). Falta el manual de arranque (env, supabase, deploy) y la documentación de decisiones del §7.
- **Fix:** README breve + estructura `docs/audit` (hoy) y luego `docs/decisions`. Costo bajo–medio.

## TD-8. `mission_progress` sin política de borrado — [verificado]
- 0005 añade políticas `delete` para `profiles` y `events` (derecho al olvido) pero **no** para `mission_progress`; el export/delete del usuario deja basura dependiente.
- **Fix (si se aprueba, J5):** migración `0006` con política `delete` para `mission_progress` (owner). Costo bajo.

## TD-9. `events.properties` validado solo en app — [verificado] + **[opinión]** bajo
- La regla «no subir valores financieros a properties» se aplica en la capa de app; la DB no la fuerza (supabase-js `properties` es `jsonb` libre).
- **Fix (opcional):** trigger/check en migración o validación en el repo. No bloqueante para demo.

## TD-10. Valores nulos de indicadores LATAM — [verificado] + **[opinión]**
- `lib/datos` tiene `null`s (p. ej. tasas no disponibles para AR); el componente los omite. Riesgo: si en el futuro se exige más exactitud, hay que decidir si delegar a valores oficiales futuros o mantener `null` honesto.

## Prioridad sugerida
1. TD-1 + TD-2 (higiene, hoy mismo).
2. TD-4/TD-5 (junto a la decisión J1 de arquitectura).
3. TD-6/TD-8 (rápidos, impacto regional y legal).
4. TD-3 (cambio de alcance, agendar).
5. TD-7/TD-9/TD-10 (mejoras continuas).