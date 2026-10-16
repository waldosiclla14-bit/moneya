# Preguntas abiertas / decisiones pendientes — MONEYA

Fecha: 2026-10-11 · Fase 0 · Ítems que requieren decisión explícita del maestro o datos que el usuario debe aportar.

---

## O0. Autorización de la siguiente fase — **resuelta**
- Autorización continua vigente del dueño ("continua" = siguiente pendiente + commit/push/CI). AGENTS §14 sigue aplicando para deploy/datos sensibles.

## O1. Credenciales de Supabase — **[diferida por decisión del dueño, 2026-10-13 → ADR-0010]**
- Faltan `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (proyecto nuevo, región `sa-east-1`, plan Free; pegar `supabase/setup-all-in-one.sql` UNA vez en SQL Editor).
- Hoy: demo sin persistencia real. Al recibir claves se pasa a `.env.local`, se prueban typecheck/tests/build con env y se verifica registro real (auth.users / financial_inputs).
- **Decisión:** límite Free agotado; demo local es el modo oficial hasta usuarios reales. Ruta de reactivación intacta (`.env.example`, `README`, setup-all-in-one con 0001–0006, Secrets CI).

## O2. Despliegue: Pages vs Vercel (arquitectura) — **resuelta definitiva → ADR-0009 (J1, 2026-10-13)**
- Opciones: (a) quedarse en GitHub Pages (`export`) → auth 100 % client-side, sin middleware; (b) migrar a Vercel full → habilita SSR/auth server y quita el problema TD-5. Implica redirigir dominio/CI.
- **Resolución [opinión, 2026-10-12]:** mantener Pages mientras el objetivo sea demo pública con URL estable (ver `docs/decisions/0001-despliegue-github-pages.md`); revisar Vercel si el MVP requiere SSR o verificación de sesión en server.
- **Decisión del dueño (2026-10-13):** Pages estático + gateo client-side (`RequireAuth`), un solo camino `createClientClient()`. Ver ADR-0009; TD-4/TD-5 resueltos.

## O3. Alcance del auth (demo-first vs real) — **resuelta definitiva → ADR-0009**
- Gateo completo de rutas (+ redirect) vs navegación libre con degradación (como hoy). **Resolución [opinión, 2026-10-12]:** navegación libre con degradación en modo demo (ver `docs/decisions/0002-autenticacion-cliente.md`); gateo/redirect cuando haya Supabase real y/o SSR. Según O2.
- **Decisión del dueño (2026-10-13):** guard `RequireAuth` listo y testeado; páginas demo abiertas a propósito; RLS como frontera real. Ver ADR-0009.

## O4. Monedas/monedas locales — **resuelta → ADR-0005**
- ¿Corregir locale por país del perfil? **Hecho (2026-10-12):** `RegionProvider` + `useRegion()` formatean por país con fallback a Chile en demo (ver `docs/decisions/0005-locale-por-pais.md`; TD-6).

## O5. Segmento inicial y métricas (§8/§13) — **[resuelta: segmento A+B aprobado 2026-10-13]**
- Propuesta en `docs/product/SEGMENTO_Y_METRICAS.md`: métricas definidas sin metas (sin línea base). Siguiente: 8–10 entrevistas CL/PE antes del piloto.

## O6. `mission_progress`: añadir política `delete` — **resuelta (TD-8)**
- **Hecho (2026-10-12):** migración `0006_mission_progress_delete_privacy.sql` + anexo en `setup-all-in-one.sql` (política `mission_progress_delete_own`). Pendiente aplicar en la instancia Supabase (O1).

## O7. README y estructura de docs — **resuelta**
- **Hecho:** `README.md` (arranque, deploy, PWA) + `docs/audit/*` + `docs/decisions/` (ADRs). Formato en Markdown, en español.

## O8. Vercel (moneya.vercel.app) desactualizado — **resuelta (J1, 2026-10-13)**
- El live canónico es GitHub Pages; por decisión J1 no se redeploya Vercel. Acción del usuario (opcional): olvidar el deploy o apuntarlo a Pages; no requiere trabajo en el repo.

## O9. `npm audit` / vulnerabilidades de dependencias — **resuelta (TD-2)**
- **Hecho:** job `security` en `gh-pages.yml` (escaneo de secretos con gate duro + `npm audit` como señal no bloqueante) y `typecheck` en el job `build`. Advisories restantes: Tailwind 3→4 (ver `SECURITY_REVIEW.md`).

## O10. Modo oscuro — **resuelta (implementado 2026-10-13)**
- Implementado por decisión del dueño: estrategia por variables (cero cambios en componentes) — `darkMode: 'class'` + escala `neutral` y tokens semánticos como vars (`tailwind.config.ts`, `globals.css` con `.dark` cálido sin negro puro y contraste ≥4.5 en textos chicos); `ThemeToggle` en el header con persistencia `moneya:tema`, script pre-pintado anti-destello y `theme-color` dinámico; `color-scheme` conmutado para controles nativos. Tests: 3 casos (`theme-toggle.test.tsx`).

---

Nota metodológica: cada ítem de O1–O10 que se apruebe pasa al plan de trabajo con criterio de aceptación (§14.1/14.2). Sin evidencia nueva, no se implementa (regla §9).