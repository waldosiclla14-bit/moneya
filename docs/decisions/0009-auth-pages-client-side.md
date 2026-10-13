# ADR-0009. Auth en Pages estático con gateo client-side (J1)

- Estado: Aceptado
- Fecha: 2026-10-13
- Contexto:
  - TD-4: sin `middleware.ts`; 6 componentes usan `useSession` client-side sin redirect. TD-5: convivían `BrowserClient` (nulo-seguro, modo demo) y `createServerClient` (lanza sin envs), aunque con `output: export` no hay SSR — [verificado] (`lib/supabase/server.ts`, `client.ts`, grep de `useSession`).
  - Decisión del dueño (J1, 2026-10-13): quedarse en Pages estático con gateo client-side.
- Decisión:
  - Un solo camino Supabase: `createClientClient()` (nulo-seguro). `lib/supabase/server.ts` eliminado (código muerto: solo re-exportado, cero imports en app) — verificado antes de borrar.
  - Nuevo `components/auth/require-auth.tsx`: si la sesión está lista y no hay usuario, `router.replace('/login')`; si no, placeholder neutro; con usuario, renderiza hijos. Testeado (3 casos).
  - Las páginas demo (finanzas, perfil, simular, bienestar, misiones, datos, aprender) se quedan **abiertas a propósito** (posicionamiento "sin cuenta y sin registro"); el patrón ante falta de sesión sigue siendo el aviso con enlace a `/login` (`SavePanel`, `DatosUsuario`).
  - La frontera real de seguridad sigue siendo **RLS en la DB** (migraciones 0001/0005/0006); el guard es UX anti-destello, no control de acceso.
- Alternativas consideradas:
  - **Migrar a Vercel full con middleware:** rechazado por ahora; implica quitar `output: export`/reconfigurar basePath, proyecto Vercel y costos, sin usuarios reales que lo justifiquen (O1 sigue bloqueado).
  - **Envolver hoy todas las páginas con `RequireAuth`:** rechazado; rompería la demo sin cuenta.
- Consecuencias:
  - Positivas: un solo cliente, sin vía de crash por envs; guard listo y testeado para futuras rutas que sí requieran sesión.
  - Negativas / pendientes: con Supabase activo (O1) convendrá aplicar `RequireAuth` en `/cuenta`; reevaluar Vercel si aparecen necesidades server-side.
- Referencias: `components/auth/require-auth.tsx`, `components/auth/__tests__/require-auth.test.tsx`, `lib/supabase/index.ts`, `docs/audit/TECHNICAL_DEBT.md` (TD-4/TD-5).
