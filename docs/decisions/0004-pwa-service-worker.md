# ADR-0004. PWA con service worker (shell offline)

- Estado: Aceptado
- Fecha: 2026-10-12
- Contexto:
  - Se buscó que MONEYA sea instalable y funcione sin conexión con una experiencia mínima.
  - El host es estático (ADR-0001) y la app no depende de datos servidor para el core.
  - Existe backend externo (Supabase) que no debe cachearse.
- Decisión: Implementar una PWA con:
  - `manifest.webmanifest` (standalone, iconos 192/512, `theme-color`) y metadatos `apple-*` en el layout.
  - `public/sw.js` con estrategia **red-primero para navegación** (fallback a `offline.html`) y **cache-primero para estáticos del mismo origen**; **no intercepta ni cachea peticiones de terceros** (p. ej. Supabase).
  - Registro del service worker **solo en producción** (`components/pwa/register-service-worker.tsx`, montado en `app/layout.tsx`).
  - Aviso de instalación in-app (`components/pwa/install-prompt.tsx`): `beforeinstallprompt` en Android/Chrome y guía manual en iOS/Safari; descartable y oculto si ya está instalada.
- Alternativas consideradas:
  - **Sin service worker (solo manifest):** no cumple el criterio de instalabilidad de Chrome ni ofrece offline; descartado.
  - **Librerías tipo Workbox/next-pwa:** añaden dependencia y build extra; innecesario para un shell simple (AGENTS §9: no agregar bibliotecas sin necesidad).
- Consecuencias:
  - Positivas: instalable, shell offline, sin dependencias nuevas; scope acotado a `/moneya/`.
  - Negativas / pendientes: la caché del shell (`moneya-shell-v1`) debe versionarse al cambiar el HTML base; el SW no cubre datos dinámicos (por diseño). Verificar en cada release que no rompa el refresco.
- Referencias: `public/sw.js`, `public/offline.html`, `components/pwa/register-service-worker.tsx`, `components/pwa/install-prompt.tsx`, `app/layout.tsx`, `README.md` (sección PWA).
