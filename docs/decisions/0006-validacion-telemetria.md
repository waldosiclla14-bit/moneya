# ADR-0006. Validación de `events.properties` (privacidad de telemetría)

- Estado: Aceptado
- Fecha: 2026-10-12
- Contexto:
  - La telemetría interna (`events`) existe para métricas de producto, no para datos financieros (AGENTS.md §11: "sin datos financieros en analítica").
  - `registrarEvento` enviaba cualquier `Json` a una columna `jsonb` libre; la regla "no subir valores financieros" era solo una convención de código (TD-9, `docs/audit/SECURITY_REVIEW.md`).
- Decisión:
  - Validar en la capa de aplicación con `validarPropiedades()` (`lib/supabase/events-repo.ts`): exige objeto plano, solo valores primitivos finitos, máx. 10 claves y 64 caracteres por texto, y **rechaza claves sensibles/financieras** (monto, ingreso, deuda, saldo, cuota, tasa, email, dni, rut, clave…).
  - `registrarEvento` valida antes de insertar. Los llamadores ya envuelven en `.catch(() => {})`, así que un evento inválido se descarta sin romper el flujo del usuario.
- Alternativas consideradas:
  - **Allowlist estricta de claves:** más segura pero bloquea usos futuros legítimos sin necesidad; se prefirió denylist + límites, revisable.
  - **CHECK/trigger en la DB (defensa en profundidad):** recomendable como segunda barrera; se pospone (requiere migración y aplicación en Supabase, ligada a O1). La app es la primera barrera.
  - **Silenciar/depurar claves en vez de lanzar error:** ocultaría el mal uso; se prefirió fallar rápido (evento se pierde, no rompe el flujo).
- Consecuencias:
  - Positivas: impide por construcción enviar datos sensibles a la telemetría; cubierto con tests (`lib/supabase/__tests__/events-repo.test.ts`).
  - Negativas / pendientes: la DB todavía no fuerza la regla (CHECK pendiente); la denylist es heurística y debe revisarse si aparecen nuevas claves.
- Referencias: `lib/supabase/events-repo.ts`, `lib/supabase/__tests__/events-repo.test.ts`, `docs/audit/TECHNICAL_DEBT.md` (TD-9), `docs/audit/SECURITY_REVIEW.md` §3.
