# ADR-0002. Autenticación 100 % client-side y navegación libre con degradación

- Estado: Aceptado (provisional)
- Fecha: 2026-10-12
- Contexto:
  - Todos los `app/**/page.tsx` son server components; 6 componentes usan `useSession` en cliente.
  - No existe `middleware.ts` ni redirect server-side; un usuario puede abrir `/cuenta` o `/datos` sin sesión (UX degradada) — [verificado] (`docs/audit/PROJECT_AUDIT.md` D1, TD-4).
  - El host elegido es estático (ADR-0001), por lo que no hay servidor Node que ejecute middleware.
  - La pregunta **O3** (gateo completo vs demo-first) seguía abierta.
- Decisión: Mantener **autenticación client-side** con **navegación libre y degradación controlada** mientras la app sea demo. Cada componente que necesita sesión gestiona el estado ausente (muestra login o modo demo) sin bloquear la navegación. El hard-gating de rutas se pospone a cuando exista Supabase real y/o se decida SSR.
- Alternativas consideradas:
  - **Middleware + `createServerClient` (gateo server-side):** incompatible con `output: export` (ADR-0001); exigiría migrar a Vercel SSR.
  - **Redirect client-side obligatorio en layout:** posible sin SSR, pero empeora la demo (bloquea páginas que hoy son explorables) y la pregunta de alcance (O3) no está cerrada.
- Consecuencias:
  - Positivas: demo navegable sin fricción; sin dependencias server-only; coherente con ADR-0001.
  - Negativas / pendientes: **riesgo alto para producción real** con datos financieros (TD-4); sin verificación de sesión en servidor no hay autorización de rutas (la autorización real de datos depende de RLS, no del cliente).
  - Reversible: requiere Supabase real (O1) y, muy probablemente, SSR (nuevo ADR que reemplace a este).
- Referencias: `docs/audit/TECHNICAL_DEBT.md` (TD-4, TD-5), `docs/audit/PROJECT_AUDIT.md` (D1, D2, J3), `docs/audit/OPEN_QUESTIONS.md` (O3), `lib/supabase/use-session.ts`.
