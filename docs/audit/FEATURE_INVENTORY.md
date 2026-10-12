# Inventario de funciones — MONEYA

Fecha: 2026-10-11 · Fase 0 (solo lectura) · Fuente: inspección de rutas, componentes y lib/ **[verificado]** salvo donde se indica.

---

## 1. Páginas (11 rutas, App Router)

| Ruta | Archivo | Función |
|---|---|---|
| `/` | `app/page.tsx` | Landing: hero 1-campo, franja de confianza verificable, grid de objetivos |
| `/onboarding` | `app/onboarding/page.tsx` | Onboarding goal-first (objetivo + perfil conductual opcional) |
| `/simular` | `app/simular/page.tsx` | Simulador «qué pasa si» |
| `/perfil` | `app/perfil/page.tsx` | Diagnóstico conductual / perfil |
| `/datos` | `app/datos/page.tsx` | Bienestar con contexto (indicadores LATAM) |
| `/misiones` | `app/misiones/page.tsx` | Lista de misiones |
| `/aprender` | `app/aprender/page.tsx` | Biblioteca de artículos |
| `/aprender/mision/[id]` | `app/aprender/mision/[id]/page.tsx` | Detalle de artículo/misión (ruta dinámica) |
| `/metodologia` | `app/metodologia/page.tsx` | Metodología y trabajo con datos |
| `/finanzas` | `app/finanzas/page.tsx` | Foto financiera del mes (persistencia local) |
| `/login` | `app/login/page.tsx` | Login/registro (client-side, Supabase) |
| `/cuenta` | `app/cuenta/page.tsx` | Cuenta: export/delete y perfil |

Características estructurales **[verificado]**:
- Sin route groups, sin middleware, sin API routes.
- Todos los `page.tsx` son **server components** (no contienen `'use client'`); el interactivo vive en `components/`.
- Nav global (`NavLinks`) con 7 vínculos; preview `SavePanel` y `Reveal` en varias páginas.

---

## 2. Componentes (16, inventario de exports)

`Library`, `LoginForm`, `DatosUsuario`, `ContextoLatam`, `FotoFinanciera`, `GoalGrid`, `HeroDemo`, `NavLinks`, `MisionesList`, `PerfilForm`, `SimuladorForm`, `CountUp`, `MetricCard`, `Reveal`, `SavePanel`, `WellbeingTest`.

| Componente | Ubicación | Uso |
|---|---|---|
| `HeroDemo` | `components/home/` | Hero landing (métricas reales) |
| `GoalGrid` | `components/home/goal-grid.tsx` | Grid de objetivos (compartido landing/onboarding) |
| `NavLinks` | `components/layout/` | Navegación global |
| `SimuladorForm` | `components/simular/` | Inputs + resultados del simulador |
| `PerfilForm` | `components/perfil/` | Diagnóstico conductual |
| `FotoFinanciera` | `components/finanzas/` | Foto del mes + auto-guardado localStorage |
| `ContextoLatam` / `CountUp` | `components/datos/`, `components/ui/` | Indicadores LATAM con animación count-up |
| `DatosUsuario` | `components/datos/` | Export/delete de datos (client) |
| `MisionesList` | `components/misiones/` | Lista de misiones |
| `LoginForm` | `components/auth/` | Login/registro (demo banner) |
| `WellbeingTest` | `components/wellbeing/` | Test de bienestar (24 ítems) |
| `MetricCard`, `Reveal`, `SavePanel` | `components/ui/`, `components/simular/` | Piezas de soporte |

---

## 3. lib/ — motor y capas

### 3.1 `lib/calculos/` (motor financiero) — [verificado, con tests]
- `types.ts` (tipos de snapshot), `money.ts` (round2 = 0 si no finito; Math.round((n+EPSILON)*100)/100), `mesesCobertura.ts`, `ratioDeuda.ts`, `concentracionIngreso.ts`, `margenFinanciero.ts`, `atenciones.ts`.
- Fórmulas **[verificado en tests]**:
  - `clampPct(pct)` → min(1, max(0, pct)).
  - `sum(lista)` → ignora valores no finitos.
  - `ingresoTotal` = dependiente + independiente + otros.
  - `gastosTotales` = esencial + noEsencial.
  - `mesesDeCobertura` = saldo líquido ÷ gastos esenciales; con esenciales = 0 → `null` si liquidez > 0, si no `0`.
  - `ratioDeuda` = pagos ÷ ingreso; `null` si ingreso = 0.
  - `concentracionIngreso` = ingreso principal ÷ total (principal = el mayor de los tres); `null` si total = 0.
  - `analizarSnapshot(snapshot)` → estructura `MargenFinanciero` (agrega balances y márgenes).

### 3.2 `lib/cfpb/` — scoring conductual
- Tablas de referencia del CFPB; score en rango **14–95**; clasificación por tramos. 16 casos de prueba.

### 3.3 `lib/datos/` — indicadores LATAM
- 5 casos de prueba coherentes con el dataset. Valores **reales con fuente** en `contexto-latam`.
- Conjuntos CL (tasa de ahorro: 85.1), PE (bancarización 59.3 / 31.4 / 20.8) y **NULLs** para países sin dato (AR — ver OPEN_QUESTIONS sobre delegación).

### 3.4 `lib/aprender/` y `lib/misiones/`
- Biblioteca: **10 artículos en 5 temas** (5 casos).
- Misiones: **10 misiones en 5 temas** (4 casos); progreso en `mission_progress` (DB).

### 3.5 `lib/perfil/`
- Lógica de `PerfilForm`; 5 casos.

### 3.6 `lib/supabase/`
- `BrowserClient` (client) y `createServerClient` (SSR).
- Repositorios para 8 tablas con **export y delete propio del usuario** (`datos-usuario`), incl. `events`.
- **Bloqueado** por falta de credenciales; design asume RLS en DB.

---

## 4. Pruebas

| Ámbito | Archivos de prueba | Casos |
|---|---|---|
| calculos | `lib/calculos/__tests__/atenciones.test.ts` | 36 |
| cfpb | `lib/cfpb/__tests__/` | 16 |
| datos | `lib/datos/__tests__/` | 5 |
| aprender | `lib/aprender/__tests__/` | 5 |
| misiones | `lib/misiones/__tests__/` | 4 |
| perfil | `lib/perfil/__tests__/` | 5 |
| supabase | `lib/supabase/__tests__/` | 8 |
| **Total** | **13 archivos** | **79** |

Limitación **[verificado]**: `vitest` incluye solo `lib/**/__tests__/**/*.test.ts` → **no hay tests de componentes UI/React** (ver TECHNICAL_DEBT D5).

---

## 5. Clasificación de cumplimiento con la visión (§4–§10 AGENTS)

- §4 Visión (bienestar financiero con datos reales): **cumple en demo**, pendiente Supabase real.
- §9 MVP (evidencia, no cantidad): motor con 79 tests → **cumple**.
- §10 UX/UI (accesibilidad, textos honestos): P0/P1 de a11y resueltos; **gap regional** de moneda (ver PROJECT_AUDIT D6).
- §8 Segmentos: **no documentado todavía**; definición pendiente en `docs/` (ver OPEN_QUESTIONS).