# Auditoría del proyecto — MONEYA

Fecha: 2026-10-11 · Fase 0 (solo lectura, agente `plan`) · Fuente: inspección de código verificada, no suposiciones.

Cada hallazgo lleva la etiqueta **[verificado]**, **[hipótesis]** u **[opinión]** según la definición de §3.2 de AGENTS.md.

---

## A. Resumen ejecutivo

MONEYA está en estado **MVP funcional y desplegado** con demo pública en GitHub Pages (`/moneya`), motor financiero con 79 pruebas unitarias verdes, andamiaje Supabase completo (migraciones 0001–0005 con RLS, `.env.example`, `setup-all-in-one.sql`) y CI que ejecuta tests y bloqueea el deploy si fallan.

- **Lo que existe:** diagnóstico CFPB (Argentina y Perú), simulador «qué pasa si», foto financiera con persistencia local, perfil conductual, bienestar, misiones, biblioteca, contexto LATAM real, login/registro (client-side, demo), cuenta, datos (export/delete lógica + RLS).
- **Lo que falta:** credenciales reales de Supabase (bloqueado externamente), redeploy de Vercel, integración Supabase activa (hoy demo sin persistencia real), README, documentación de arquitectura, tests de componentes UI, typecheck en CI.
- **Riesgo principal actual:** la autenticación es 100 % client-side sin middleware ni rutas protegidas; aceptable para demo, no para producción (§ opinión).

**Veredicto:** base sólida; las siguientes inversiones de alto valor son (1) activar Supabase real, (2) subir la seguridad del auth a rutas protegidas/middleware, (3) documentar README + decisiones.

---

## B. Estado real del proyecto

### Stack (package.json) — [verificado]
- Next **16.3.6** (App Router), React **19.3.0**, TypeScript **5.6.3**.
- Tailwind **3.4.19**, framer-motion, lucide-react.
- supabase-js **2.117.1** (repos `BrowserClient` y `createServerClient`).
- Vitest **2.1.8** con coverage en generación `V8`.

### Rutas (11 páginas, sin route groups, sin middleware, sin API routes) — [verificado]
`/`, `/onboarding`, `/simular`, `/perfil`, `/datos`, `/misiones`, `/aprender`, `/aprender/mision/[id]` (dinámica), `/metodologia`, `/finanzas`, `/login`, `/cuenta`.

### Estructura
- `app/*` (12 archivos page) — todos **server components**; los formularios/estado son client en `components/`.
- `components/` (16 componentes; inventario completo en FEATURE_INVENTORY.md).
- `lib/` (motor): `calculos/`, `cfpb/`, `datos/`, `aprender/`, `misiones/`, `perfil/`, `supabase/`.
- `supabase/migrations/0001..0005*.sql` + `setup-all-in-one.sql` (concatenación generada).
- `public/` (manifest, iconos PNG/ICO/SVG, og.png).
- CI: `.github/workflows/gh-pages.yml` (único workflow).

### Builds y despliegue — [verificado]
- GitHub Pages: build `export` con `output: "export"`, `basePath /moneya`, `BUILD_MODE=export` (next.config dual para `moneya.vercel.app` sin basePath). Autodeploy en push a `master`; el job `tests` bloquea `deploy`.
- 14 runs de CI exitosos recientes (tests + deploy); los últimos validados en esta sesión.

### Git — [verificado]
- Rama `master`, working tree limpio salvo `docs/audit/` (recién creado) y `AGENTS.md` (sin commitear por regla §14).
- **`tsconfig.tsbuildinfo` está commiteado** — gap de `.gitignore`.
- 15+ commits recientes, estilo de mensajes cortos en español/inglés mixto.

---

## C. Funciones existentes / faltantes / parciales

Clasificación:
- **Implementada y verificada** = tiene pruebas automatizadas verdes.
- **Implementada sin pruebas automatizadas** = funciona en build/live pero sin test unitario (UI).
- **Parcial** = falta una pieza clave.
- **Bloqueada** = implementada pero inutilizable sin credenciales/action del usuario.

| Función | Estado | Evidencia |
|---|---|---|
| Motor cálculo (atenciones, margen, meses cobertura, ratio deuda, concentración, ingreso/gastos) | Implementada y verificada | `lib/calculos/` 36 casos en `lib/**/__tests__` |
| Score CFPB (14–95) | Implementada y verificada | `lib/cfpb/` 16 casos |
| Diagnóstico /perfil conductual | Implementada sin pruebas UI | page + `PerfilForm` |
| Landing con franja de confianza verificable | Implementada (verificada en live) | `app/page.tsx`, `HeroDemo`, métricas reales |
| Grid de objetivos (landing y onboarding) | Implementada | `components/home/goal-grid.tsx` compartido |
| Simulador «qué pasa si» | Implementada y verificada (motor) | `lib/calculos`, `SimuladorForm` |
| Foto financiera con persistencia local | Implementada sin pruebas UI | `FotoFinanciera` + localStorage `moneya:foto:mes:v1` |
| Datos LATAM con valores reales | Implementada parcial (declarado) | `lib/datos/` 5 casos; 4 URL APnews 404 / 4 scam verificados |
| Misiones (10, 5 temas) | Implementada y verificada (repo) | `lib/misiones/` 4 casos, `MisionesList` |
| Biblioteca (10 artículos, 5 temas) | Implementada y verificada (repo) | `lib/aprender/` 5 casos |
| Bienestar (test 24 ítems) | Implementada sin pruebas UI | `WellbeingTest`, `lib/` bienestar |
| Auth login/registro (demo) | **Bloqueada** (sin credenciales reales) | `login-form.tsx`, `lib/supabase` |
| Persistencia de perfil (profiles_arc) | Implementada, bloqueada por auth real | repos + migraciones |
| Export/delete usuario (8 tablas) | Implementada parcial (lógica en repo + policies 0005; sin UI full docs) | `datos-usuario` repo; ver SECURITY_REVIEW |
| Modo oscuro | No existe | [verificado] ninguna clase dark en `package.json`/layout |

---

## D. Hallazgos técnicos y riesgos

### D1. Autenticación sin protección real de rutas — [verificado] + [opinión] riesgo alto
- Todos los `page.tsx` son server components; 6 componentes hacen `useSession` **client-side**.
- **No hay middleware**, no hay `redirect` server-side, no hay hard-gating: un usuario puede navegar a `/cuenta` o `/datos` sin sesión (se degrada o muestra login).
- Para demo es aceptable y honesto; para producción hay que decidir gateo. Ver D2.

### D2. Enfoque `supabase` con `output: export` — [verificado] + [opinión]
- Se usa `createServerClient` (SSR) además de `BrowserClient`; en `output: export` no hay node server: depende de leer URL/anon desde `process.env`. Implica riesgo de **crash en build/SSR si faltan las env** (ver SECURITY_REVIEW D2).

### D3. `tsconfig.tsbuildinfo` commiteado — [verificado] gap de higiene
- El artefacto incremental `tsbuildinfo` se versiona; es ruido + posible conflicto. Añadir a `.gitignore` y `git rm --cached`.

### D4. Falta typecheck en CI — [verificado]
- `package.json` tiene script `typecheck` (tsc --noEmit) pero **no se ejecuta en gh-pages.yml**; el flujo de CI solo corre vitest + export build. El build de Next sí compila TS al generar el export, así que el riesgo es menor; aun así conviene job explícito (regla §11).

### D5. Sin tests de componentes UI — [verificado]
- Vitest incluye solo `lib/**/__tests__/**/*.test.ts`; no hay tests de React (render, eventos, a11y).
- 16 componentes de UI quedan sin cobertura automatizada (inventario en FEATURE_INVENTORY.md).

### D6. Locale/currency hardcodeado — [verificado] + [opinión] gap regional
- `FotoFinanciera` usa `new Intl.NumberFormat('es-CL', …)` para formatear montos incluso para perfiles de Argentina/Perú (§10 UX/UI pide experiencia localizada; ver OPEN_QUESTIONS para decisión de alcance).

### D7. Sin README ni docs de arquitectura — [verificado]
- No existe `README.md` ni carpeta `docs/` (hasta ahora). Afecta onboarding, decisiones, segmento inicial.

### D8. Regla de eventos (telemetría interna) sin enforcement en DB — [verificado] + [opinión] bajo
- `events.properties` valida formato en app (lit-rule) pero no a nivel DB; bajo riesgo en demo, documentar en SECURITY_REVIEW.

---

## E. Evidencia del problema (si las hay)

- E1. **Auth real sin credenciales**: la demo de login muestra banner «modo demo»; no se puede validar flux end-to-end de registro → bloqueado (acción externa).
- E2. **Vercel desactualizado**: `https://moneya.vercel.app` sirve un build previo; el live actual correcto es GitHub Pages.
- E3. **Sin verificación live de export**: build `export` solo se valida en CI (la RAM local no alcanza). Riesgo de regresión específica de `output: export`.
- Todo lo demás en FEATURE_INVENTORY/TECHNICAL_DEBT.

---

## F. Preguntas de investigación (para la siguiente iteración)

1. ¿Activamos Supabase real (credenciales) o dejamos demo-first y seteamos un timeline? (bloqueado por clave del usuario)
2. ¿Adoptamos gateo de rutas con middleware + `createServerClient` (aleja la demo de `output: export`)? ¿Migra el deploy a Vercel full-SSR?  (decisión de arquitectura y seguridad — ver AGENTS §11)
3. ¿Mantenemos `createServerClient` dado el export y la RAM local? (alternativa: solo BrowserClient + `useEffect` redirect)
4. ¿Dónde documentamos el segmento inicial y las personas/métricas (AGENTS §8)? ¿Nacimiento de `docs/`?
5. ¿Corregimos locale de moneda por país del perfil (es-CL vs es-AR vs es-PE)?
6. ¿Añadimos política `delete` para `mission_progress` (derecho al olvido completo, gap vs 0005)?
7. ¿Activamos secrets scan + typecheck como jobs de CI?

---

## G. Oportunidades (mejoras de mayor impacto)

1. **Activar Supabase real** → el login/persistencia pasan de demo a usable; + deuda: probar registro, RLS, export/delete reales.
2. **Bloquear auth con middleware** (y decidir SSR vs export).
3. **README + `docs/`: identidad del proyecto, decisiones, guía local y de deploy** (imprescindible para onboarding).
4. **typecheck + secrets scan en CI** (bajo costo, alinea con §11 arquitectura/seguridad).
5. **Tests de UI (react-testing-library)** para login/formularios y FotoFinanciera (hoy la única capa sin pruebas).
6. **Gap regional**: formatear moneda por país del perfil.
7. **Modo oscuro** (opcional, alineado con §10 UX/UI pero sin demanda actual).

---

## H. Cinco prioridades (orden sugerido)

1. **Activar Supabase real (login + persistencia)** — desbloquea el core de valor; requiere credenciales del usuario.
2. **Auth con rutas protegidas** (middleware o redirect client-side claro) — cierra el riesgo D1.
3. **README + docs/ de arquitectura y decisiones** — elimina D7 y habilita el onboarding y la revisión de la Fase 0.
4. **typecheck + secrets scan en CI y limpiar tsbuildinfo** — higiene de bajo costo (D3/D4).
5. **Tests UI para el flujo crítico** (registro → perfil → finanzas) — cierra D5 en lo esencial.

---

## I. Plan de dos semanas (si se autoriza)

Semana 1 (bloqueado a credenciales): Supabase activo con registro real, gateo de rutas, README, CI typecheck/secrets, limpieza tsbuildinfo.
Semana 2: tests UI del flujo crítico, decicisión de arquitectura SSR vs export, (opcional) locale por país, revisión segmento/personas misiones.

Cada ítem cumple §14.1/§14.2 (Definition of Ready/Done, ciclos cortos) y no se commitea/pushea sin autorización explícita.

---

## J. Decisiones que requieren aprobación

1. **Dónde vivir la app en producción**: seguir en GitHub Pages (`export`) vs migrar a Vercel full-SSR (afecta auth SSR y middleware).
2. **Alcance de Supabase**: solo demo futura vs real activa con credenciales reales.
3. **Auth**: gateo completo de rutas (rompería la navegación libre de la demo) vs demo-first con aviso.
4. **Monedas por región**: implementar ahora o posponer.
5. **Borrar policy en `mission_progress`**: añadir (completa derecho al olvido) o mantener.
6. **Docs/README**: formato y lugar (docs/audit + README.md).

---

## K. Archivos a crear/modificar propuestos (según autorización)

- **Crear**: `README.md`, `docs/audit/{FEATURE_INVENTORY,TECHNICAL_DEBT,SECURITY_REVIEW,OPEN_QUESTIONS}.md` (este archivo es PROJECT_AUDIT).
- **Modificar**: `.gitignore` (+`tsconfig.tsbuildinfo`), `.github/workflows/gh-pages.yml` (+typecheck, +secrets/dependency scan), `lib/finanzas`/`FotoFinanciera` (locale por país, si se aprueba), `supabase/migrations/0006_*.sql` (policy delete mission_progress, si se aprueba), `lib/supabase` (gating de rutas, si se aprueba).
- **Acción externa**: credenciales Supabase, redeploy Vercel.

---

Fecha de última actualización: 2026-10-11. Auditado con datos verdes (79 tests, 14 CI runs).