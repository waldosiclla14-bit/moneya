# Preguntas abiertas / decisiones pendientes — MONEYA

Fecha: 2026-10-11 · Fase 0 · Ítems que requieren decisión explícita del maestro o datos que el usuario debe aportar.

---

## O0. Autorización de la siguiente fase — **[bloqueante]**
- AGENTS.md §14: nada de commit/push/deploy sin autorización explícita.
- Pendiente: ¿autorizas commitear `AGENTS.md` + `docs/audit/` y proceder con la tarea de `build` (o con la auditoría de MONEYA Emprende, §15)?

## O1. Credenciales de Supabase — **[bloqueante, requiere acción del usuario]**
- Faltan `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (proyecto nuevo, región `sa-east-1`, plan Free; pegar `supabase/setup-all-in-one.sql` UNA vez en SQL Editor).
- Hoy: demo sin persistencia real. Al recibir claves se pasa a `.env.local`, se prueban typecheck/tests/build con env y se verifica registro real (auth.users / financial_inputs).

## O2. Despliegue: Pages vs Vercel (arquitectura) — **[requiere decisión]**
- Opciones: (a) quedarse en GitHub Pages (`export`) → auth 100 % client-side, sin middleware; (b) migrar a Vercel full → habilita SSR/auth server y quita el problema TD-5. Implica redirigir dominio/CI.
- Recomendación **[opinión]**: mientras el objetivo sea demo pública con URL estable, mantener Pages; decidir Vercel si el MVP requiere SSR o verificación de sesión en server.

## O3. Alcance del auth (demo-first vs real) — **[requiere decisión]**
- Gateo completo de rutas (+ redirect) vs navegación libre con degradación (como hoy). En modo demo libre, un usuario puede abrir `/cuenta` sin sesión (UX degradada). Según O2.

## O4. Monedas/monedas locales — **[requiere decisión]**
- ¿Corregir locale por país del perfil (es-AR/ARS, es-CL/CLP, es-PE/PEN) en `FotoFinanciera` y donde aplique? (TD-6). Costo bajo.

## O5. Segmento inicial y métricas (§8/§13) — **[requiere decisión]**
- AGENTS pide definir segmento y métricas **antes** del piloto; aún no documentado en `docs/`. Propuesta pendiente de revisión con el maestro.

## O6. `mission_progress`: añadir política `delete` — **[requiere decisión, baja]**
- Migración 0006 para completar el borrado de datos de usuario (TD-8). Sí recomendado (derecho al olvido).

## O7. README y estructura de docs — **[requiere decisión]**
- Propuesta: `README.md` breve + `docs/audit/*` (ya creado). ¿Formato/idioma preferido?

## O8. Vercel (moneya.vercel.app) desactualizado — **[requiere acción del usuario]**
- El live correcto hoy es GitHub Pages; Vercel sirve un build viejo. ¿Redeploy manual u olvidarlo en favor de O2?

## O9. `npm audit` / vulnerabilidades de dependencias — **[requiere decisión]**
- Recomendado añadir job de scan (vulnerabilities + secretos) en CI, alineado con §11 (SECURITY_REVIEW §7).

## O10. Modo oscuro — **[requiere decisión, opcional]**
- Continuación previa dejó a un lado el dark mode. ¿Se agenda o se descarta por ahora (sin demanda actual)?

---

Nota metodológica: cada ítem de O1–O10 que se apruebe pasa al plan de trabajo con criterio de aceptación (§14.1/14.2). Sin evidencia nueva, no se implementa (regla §9).