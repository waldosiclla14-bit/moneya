# MONEYA

Bienestar financiero para Perú y Chile: ayuda a entender la situación financiera, anticipar problemas de liquidez y decidir con información. No juzga, no presta, no vende productos.

Demo pública: <https://waldosiclla14-bit.github.io/moneya/>

---

## Qué hace hoy

- **Diagnóstico conductual** (`/perfil`): preguntas de referencia (CFPB) con score explicable, rango 14-95.
- **Simulador «qué pasa si»** (`/simular`): escenarios de ingresos, gastos, deuda y emergencias, con resultados en dinero y tiempo.
- **Foto financiera** (`/finanzas`): margen, meses de cobertura, ratio de deuda y concentración de ingreso. En la demo se guarda automáticamente en el navegador (localStorage) y se puede volver a datos de ejemplo.
- **Datos LATAM** (`/datos`): indicadores comparados (tasa de ahorro, bancarización por país) con valores reales y fuente; bienestar con contexto.
- **Misiones y biblioteca** (`/misiones`, `/aprender`): 10 misiones y 10 artículos en 5 temas.
- **Login/registro y persistencia** (`/login`, `/cuenta`): listo para activar con Supabase; sin credenciales la app corre en modo demo.
- Landing orientada a objetivos y onboarding en dos pasos (objetivo + perfil conductual opcional).

## Stack

- Next.js **16** (App Router) con React **19** y TypeScript **5.6**
- Tailwind CSS **3.4** + framer-motion + lucide-react
- Supabase (opcional): `@supabase/supabase-js` 2.x
- Tests: Vitest **5** (86 tests / 15 archivos; `lib/` + primer test de componente con React Testing Library + jsdom)

## Desarrollo local

Requisito: Node 24 (el mismo que usa CI) y npm.

```bash
npm install
npm run dev
```

Comandos útiles:

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | suite Vitest (`{lib,components}/**/*.test.{ts,tsx}`; componentes corren en jsdom) |
| `npm run build` | build; usa `BUILD_MODE=export` para Pages, SSR para Vercel |

Nota: en equipos con poca RAM el build `export` puede no terminar localmente; se valida en CI.

## Configuración de entorno

Copia `.env.example` a `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sin variables (o vacías) la app sigue funcionando en **modo demo**. Los pasos del setup Supabase están documentados en `.env.example`.

## Despliegue

- **GitHub Pages** (demo viva): push a `master` dispara el workflow que corre typecheck + tests + build `export` y publica en `/moneya`. Para activar login real, agrega como Secrets del repo `SUPABASE_URL` y `SUPABASE_ANON_KEY` (Settings → Secrets and variables → Actions).
- **Vercel** (`moneya.vercel.app`): build SSR, mismas variables. Puede requerir redeploy manual tras cada cambio.

## PWA (instalable)

- `manifest.webmanifest` (standalone, iconos 192/512) + `theme-color` + registro de service worker en producción.
- `public/sw.js`: red-primero para navegación con fallback a `offline.html`; cache-primero para estáticos del mismo origen. No cachea ni intercepta peticiones de terceros (p. ej. Supabase).
- Instalable desde el menú del navegador (Android/Chrome, iOS/Safari "Añadir a pantalla de inicio", escritorio).

## Estructura

```
app/                 páginas (server components) y metadata/rutas (sitemap, robots, manifest)
components/          UI (formularios, tarjetas, count-up, goal grid, etc.)
lib/calculos/        motor financiero determinista (con __tests__)
lib/cfpb/            scoring CFPB (con __tests__)
lib/datos/           indicadores LATAM (con __tests__)
lib/aprender/        biblioteca (con __tests__)
lib/misiones/        misiones (con __tests__)
lib/perfil/          lógica de perfil (con __tests__)
lib/supabase/        client/repo de Supabase (+ export/delete de datos)
supabase/migrations/ schema y RLS (0001-0005) + setup-all-in-one.sql
docs/audit/          informe de auditoría Fase 0
scripts/             scan-secrets.sh (ejecutado en CI)
```

## Seguridad y privacidad

- No se guardan contraseñas bancarias; no hay conexión bancaria ni analítica de terceros.
- La telemetría es first-party (tabla `events`) y no registra valores financieros en `properties`.
- Supabase: RLS habilitado en todas las tablas; el usuario puede exportar y borrar sus datos.
- CI: gate duro de escaneo de secretos + typecheck; `npm audit` reporta advisories conocidos sin bloquear el deploy (ver `docs/audit/SECURITY_REVIEW.md`).

## Documentación

- `AGENTS.md`: gobernanza del proyecto (fases, protocolo de tareas, reglas).
- `docs/audit/`: auditoría Fase 0 (estado real, deuda técnica, seguridad, preguntas abiertas).

## Estado

- Motor financiero: verificado con 86 tests unitarios; CI en verde.
- Supabase: pendiente de credenciales reales (hoy demo sin persistencia en DB).
- Vercel: sirve un build previo.