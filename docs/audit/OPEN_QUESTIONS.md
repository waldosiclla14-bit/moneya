# Preguntas abiertas / decisiones pendientes — MONEYA

Fecha: 2026-10-11 · Fase 0 · Ítems que requieren decisión explícita del maestro o datos que el usuario debe aportar.

---

## O0. Autorización de la siguiente fase — **[bloqueante]**
- AGENTS.md §14: nada de commit/push/deploy sin autorización explícita.
- Pendiente: ¿autorizas commitear `AGENTS.md` + `docs/audit/` y proceder con la tarea de `build` (o con la auditoría de MONEYA Emprende, §15)?

## O1. Credenciales de Supabase — **[bloqueante, requiere acción del usuario]**
- Faltan `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (proyecto nuevo, región `sa-east-1`, plan Free; pegar `supabase/setup-all-in-one.sql` UNA vez en SQL Editor).
- Hoy: demo sin persistencia real. Al recibir claves se pasa a `.env.local`, se prueban typecheck/tests/build con env y se verifica registro real (auth.users / financial_inputs).

## O2. Despliegue: Pages vs Vercel (arquitectura) — **resuelta provisionalmente → ADR-0001**
- Opciones: (a) quedarse en GitHub Pages (`export`) → auth 100 % client-side, sin middleware; (b) migrar a Vercel full → habilita SSR/auth server y quita el problema TD-5. Implica redirigir dominio/CI.
- **Resolución [opinión, 2026-10-12]:** mantener Pages mientras el objetivo sea demo pública con URL estable (ver `docs/decisions/0001-despliegue-github-pages.md`); revisar Vercel si el MVP requiere SSR o verificación de sesión en server.

## O3. Alcance del auth (demo-first vs real) — **resuelta provisionalmente → ADR-0002**
- Gateo completo de rutas (+ redirect) vs navegación libre con degradación (como hoy). **Resolución [opinión, 2026-10-12]:** navegación libre con degradación en modo demo (ver `docs/decisions/0002-autenticacion-cliente.md`); gateo/redirect cuando haya Supabase real y/o SSR. Según O2.

## O4. Monedas/monedas locales — **resuelta → ADR-0005**
- ¿Corregir locale por país del perfil? **Hecho (2026-10-12):** `RegionProvider` + `useRegion()` formatean por país con fallback a Chile en demo (ver `docs/decisions/0005-locale-por-pais.md`; TD-6).

## O5. Segmento inicial y métricas (§8/§13) — **[requiere decisión]**
- AGENTS pide definir segmento y métricas **antes** del piloto; aún no documentado en `docs/`. Propuesta pendiente de revisión con el maestro.

## O6. `mission_progress`: añadir política `delete` — **resuelta (TD-8)**
- **Hecho (2026-10-12):** migración `0006_mission_progress_delete_privacy.sql` + anexo en `setup-all-in-one.sql` (política `mission_progress_delete_own`). Pendiente aplicar en la instancia Supabase (O1).

## O7. README y estructura de docs — **resuelta**
- **Hecho:** `README.md` (arranque, deploy, PWA) + `docs/audit/*` + `docs/decisions/` (ADRs). Formato en Markdown, en español.

## O8. Vercel (moneya.vercel.app) desactualizado — **[requiere acción del usuario]**
- El live correcto hoy es GitHub Pages; Vercel sirve un build viejo. ¿Redeploy manual u olvidarlo en favor de O2?

## O9. `npm audit` / vulnerabilidades de dependencias — **resuelta (TD-2)**
- **Hecho:** job `security` en `gh-pages.yml` (escaneo de secretos con gate duro + `npm audit` como señal no bloqueante) y `typecheck` en el job `build`. Advisories restantes: Tailwind 3→4 (ver `SECURITY_REVIEW.md`).

## O10. Modo oscuro — **[requiere decisión, opcional]**
- Continuación previa dejó a un lado el dark mode. ¿Se agenda o se descarta por ahora (sin demanda actual)?

---

Nota metodológica: cada ítem de O1–O10 que se apruebe pasa al plan de trabajo con criterio de aceptación (§14.1/14.2). Sin evidencia nueva, no se implementa (regla §9).