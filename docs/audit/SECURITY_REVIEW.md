# Revisión de seguridad y privacidad — MONEYA

Fecha: 2026-10-11 · Fase 0 (solo lectura) · Basado en inspección de código y migraciones **[verificado]** salvo etiquetas.

---

## 1. Resumen

- **Sin secretos hardcodeados** en el repo (scan de patrones: claves `sb_`, `service_role`, URL de proyecto, `anon` literales, tokens genéricos) **[verificado]**. La única ocurrencia del dominio `supabase.com` está en un texto de ayuda, no en credenciales.
- La demo hoy funciona **sin red real**: los datos viven en localStorage/código y la telemetría solo usa un repositorio interno de eventos **first-party**. No hay terceros (pixels, analytics, fonts externas).
- El deploy de Pages es estático (`output: export`): **no hay servidor**, la persistencia pendiente es vía Supabase (SaaS con RLS).

## 2. Estado de secretos y entorno — [verificado]

| ítem | Estado |
|---|---|
| `.env` / `.env.local` | gitignored ✓ |
| `.env.example` | commiteado con placeholders y guía de setup ✓ |
| `gh-pages.yml` | usa `${{ secrets.SUPABASE_URL }}` y `${{ secrets.SUPABASE_ANON_KEY }}`; si faltan quedan vacíos → demo mode (sin riesgo) ✓ |
| `tsbuildinfo` | commiteado (solo artefacto de build, sin secretos) |
| `public/manifest`, iconos, `og.png` | contenidos estáticos sin secretos ✓ |

## 3. Postura por defecto (Supabase)

- La **anon key es pública** por diseño; el verdadero control está en RLS + policies. **[verificado en migraciones]**.
- Migraciones 0001–0005: RLS habilitado en tablas; policies por owner.
  - 0005 añade políticas `delete` para `profiles_delete_own` y `events_delete_own` (derecho al olvido). **[verificado]**
  - **Gap:** `mission_progress` no tiene política `delete` (datos huérfanos al borrar usuario) — ver TECHNICAL_DEBT TD-8.
- `events.properties` (telemetría interna) valida en app que no se envíen valores financieros: `validarPropiedades()` rechaza claves sensibles, estructuras anidadas y valores no finitos (TD-9 → resuelto); la DB aún no fuerza la regla por CHECK — **[verificado, bajo]**.

## 4. Logging y telemetría — [verificado]

- Único backend de eventos: **repo interno de la propia app** (tabla `events`), sin SDK externo.
- Decisiones del proyecto (documentadas en código) sobre qué NO registrar en properties.
- Riesgo restante: que una futura integración de terceros entierre esto; dejar constancia en docs de decisiones.

## 5. Riesgos pendientes (con decisión)

- **R1 (alto):** auth client-side sin middleware ni gates server-side (TD-4). Ver OPEN_QUESTIONS/Q1. **[opinión]**.
- **R2 (medio):** si se activa `createServerClient` con SSR + env ausente, `lib/supabase/server.ts` lanza error → posible crash de página/producto (TD-5). **[verificado]**, mitigación = un solo camino de auth.
- **R3 (medio):** sin protección en `mission_progress` para borrado (TD-8).
- **R4 (bajo):** límites de rate-limit/verificación de email dependen de defaults de Supabase (fuera de nuestro control; no verificable desde el repo). **[hipótesis]**: conviene activar verificación de email en dashboard al crear el proyecto.

## 6. OWASP quick check (demo estática) — **[opinión]**

- XSS: render React escapando por defecto; HTML inyectado (JSON-LD) solo con string estática del propio código. ✓
- CSRF: acciones autenticadas pendientes de implementar (Supabase maneja tokens). Neutral hasta integrar auth.
- Secrets en código: none found ✓.
- Dependencias: `npm audit` no blockea el deploy hoy; recomendar job de vulnerability scan (alineado con §11) — **[hipótesis]** del nivel de riesgo, costo de implementación bajo.

## 7. Recomendaciones (criterio de aceptación para cerrar)

1. (Hecho) Job CI: escaneo de secretos + `npm audit` + `typecheck` antes de `deploy`.
2. Decisión de auth → camino único (J1 OPEN_QUESTIONS).
3. Migración 0006 para `delete` en `mission_progress`.
4. Activar verificación de email en Supabase al crear el proyecto (documentar en `.env.example`).
5. Documentar la regla anti-tracking de `events` en docs de decisiones.

## 8. Riesgos conocidos de dependencias (dev) — [verificado 2026-10-11 / actualizado, `npm audit`]

**Progreso:** la cadena del *test runner* se resolvió subiendo `vitest` a **5.0.3** + `vite` **7.3.7** (vitest 5 declara `vite` como peerDependency). Advisories totales: **13 → 7 (2 moderate, 5 high)**. Los resueltos eran: `@vitest/mocker` (moderate), `tinypool` (critical ×2). Evidencia: typecheck en verde + 79/79 tests con vitest 5.

**Pendientes (todo el tooling de build de Tailwind 3.4.19):**

| Paquete (vía) | range vulnerable | severidad | fix disponible |
|---|---|---|---|
| braces (chokidar, micromatch) | `*` | high | solo tailwindcss 4.3.3 (breaking) |
| fast-glob | `*` | high | solo tailwindcss 4.3.3 (breaking) |
| micromatch | `>=0.2.0` | high | solo tailwindcss 4.3.3 (breaking) |
| chokidar | `2.0.0 - 3.6.0` | high | solo tailwindcss 4.3.3 (breaking) |
| postcss-selector-parser (postcss-nested) | `<7.1.6` | moderate | tailwindcss 4.3.3 (breaking) |

- `braces`/`fast-glob`/`micromatch` reportan `range=*` → **no existe versión segura**; ningún `overrides` los limpia.
- **No afectan el runtime**: el deploy es un export estático (sin Node server); estos paquetes no entran en el bundle de producción, solo en el pipeline de build/Tailwind.
- Único camino: upgrade *breaking* a **Tailwind 4** (config CSS-first, posible reescritura de tema/clases). **Diferido** a un ciclo autorizado aparte con su DoR.
- Decisión vigente: `npm audit` corre con `continue-on-error: true` (visible en logs del job `security`); el escaneo de secretos **sí** es gate duro. Si la app pasa a producción con servidor, resolver la cadena antes (volver a gate duro).