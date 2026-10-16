# ADR-0010. Demo local como modo oficial (backend diferido)

- Estado: Aceptado
- Fecha: 2026-10-13
- Contexto:
  - O1 pedía crear el proyecto Supabase para activar login/persistencia. El dueño reportó límite agotado en Supabase Free y eligió seguir en demo local — [verificado] (decisión en sesión).
  - La app ya funciona 100% sin backend: cálculos en navegador, snapshots/deudas/perfil/test/misiones en `localStorage`, panel "Tu foto de hoy" lee lo guardado, telemetría degradada sin romper flujo (`.catch(() => {})`) — [verificado].
- Decisión:
  - Demo local es el modo oficial hasta haber usuarios reales. Sin cambios de código.
  - La ruta Supabase queda intacta y documentada (`.env.example`, `README`, `supabase/setup-all-in-one.sql` con migraciones 0001–0006, Secrets de CI); reactivarla es solo crear proyecto + SQL + envs.
  - Opciones descartadas: migrar a Neon+Clerk (reescritura mayor de repos/auth sin usuarios que lo justifiquen), forzar otra cuenta Supabase.
- Consecuencias:
  - Positivas: costo cero, cero migración, PWA offline coherente (todo local).
  - Negativas / límites honestos: sin login real, sin persistencia cruzada entre dispositivos/navegadores, migración 0006 sin aplicar en ninguna instancia (no existe instancia), métricas de retención/activación no medibles a nivel servidor.
- Referencias: `docs/audit/OPEN_QUESTIONS.md` (O1), `.env.example`, `supabase/setup-all-in-one.sql`.
