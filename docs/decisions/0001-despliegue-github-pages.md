# ADR-0001. Despliegue estático en GitHub Pages

- **Estado:** Aceptado
- **Fecha:** 2026-10-12
- **Contexto:**
  - El proyecto necesita una URL pública estable para la demo del MVP.
  - El repositorio ya publica en GitHub Pages con build estático `output: 'export'`, `basePath` configurable y autodeploy en cada push a `master` (`next.config.js`/`moneya/next.config.mjs:11-16`; `.github/workflows/gh-pages.yml`).
  - La alternativa (Vercel SSR) permitiría middleware y auth server-side, pero la pregunta **O2** seguía abierta (`docs/audit/OPEN_QUESTIONS.md`).
  - La app es una **demo sin datos reales** mientras no existan credenciales de Supabase (O1); el core es cálculo client-side.
- **Decisión:** Mantener **GitHub Pages con `output: export`** (build estático, `BUILD_MODE=export`, `NEXT_PUBLIC_BASE_PATH=/moneya`) como host de la demo pública. El build de Vercel SSR queda como opción secundaria, no como fuente de verdad. La autenticación se resuelve client-side (ver ADR-0002).
- **Alternativas consideradas:**
  - **Vercel full-SSR:** habilita middleware y sesión en servidor (cerraría TD-5 y permitiría gateo server-side), pero implica dominio/CI nuevos y no es necesario para una demo estática; se pospone hasta que el MVP requiera SSR o verificación de sesión en servidor.
  - **Ambos en paralelo (Pages + Vercel):** ya ocurre de facto (`moneya.vercel.app` sirve un build viejo), genera confusión sobre cuál es el "live". Se aclara que el host correcto es Pages (ver O8).
- **Consecuencias:**
  - Positivas: URL estable y gratuita, despliegue automático en `master`, sin servidor que mantener; coherente con el estado demo-first.
  - Negativas / pendientes: sin SSR ni middleware → el auth no puede gatearse en servidor (deriva en ADR-0002 y TD-4); `output: export` obliga a `images.unoptimized` y a no usar features server-only.
  - Reversible: migrar a Vercel SSR requeriría revertir este ADR con uno nuevo.
- **Referencias:** `next.config.mjs:11-17`, `.github/workflows/gh-pages.yml:18-40`, `docs/audit/OPEN_QUESTIONS.md` (O2, O8), `docs/audit/PROJECT_AUDIT.md` (J1, D2).
