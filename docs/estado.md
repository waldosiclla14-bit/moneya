# Estado de MONEYA — log de sesión

Protocolo: AGENTS.md §2.5. Cada sesión cierra con decisiones, archivos, verificación y siguiente paso.

---

## 2026-10-22 · Cierre: actualización de seguridad Next.js 16.4.0 → 16.4.2 (desplegado)

### Decisión
Next.js 16.4.0 estaba afectada por un advisory de seguridad publicado (`npm audit` / aviso al ejecutar `next dev`). Se aplicó la actualización del mismo major a la versión exacta 16.4.2 en un **worktree separado** (`moneya-security-upgrade`), se verificó, se mezcló a `master` y se desplegó a GitHub Pages mediante el CI existente.

### Archivos modificados
`package.json` · `package-lock.json` (next@16.4.2) · `next.config.mjs` (`experimental.agentUpgrade: 'security'`).

### Qué se probó y cómo (comando + resultado)
- Verificación en worktree separado antes de mezclar:
  - `next --version` → v16.4.2 (target exacto del advisory) ✓
  - `npm run typecheck` → exit 0 ✓
  - `npm test` → **178/178** (32 archivos) ✓
  - `npm run build` (estático/export) → exit 0 ✓
- Reporte de éxito enviado a Next.js telemetry (`report-agent-upgrade … success`) ✓
- Merge a `master` por fast-forward + push → CI run `39886908711` → **success** ✓
- Producción verificada tras despliegue: auditoría **0 hallazgos en 48 pasadas**, home **2881 px @390 / 2115 px @1280** (idéntico a antes del upgrade) ✓

Worktree y rama temporal eliminados; el repo queda en `master` con la versión parcheada.

### Siguiente paso pendiente (requiere tu decisión/credenciales)
- **O1: Supabase real** — configurar secretos `SUPABASE_URL`/`SUPABASE_ANON_KEY` en GitHub para que la demo publique la UI con sesión (exportar/eliminar datos, guardados en nube) y pasar la auditoría `--sesion` a CI con un usuario de prueba dedicado. Requiere tus credenciales del proyecto y autorización para tocar secretos.

---

## 2026-10-22 · Bloque B: home móvil compacto (3216 → 2881 px, −10.4%)

### Problema (evidencia)
Medición real por bloques del home a 390 px (Chrome headless + CDP, script `medir-home.cjs`): documento de **3216 px** con el **GoalGrid de 1379 px (42.9 %)**, header de **149 px** (3 filas: logo/enlaces/toggle) vs 61 px en desktop, y el wrapper `space-y-10` sumando 120 px de huecos. Desktop (1280) en 2119 px, sin problema.

### Decisiones tomadas y por qué
1. **Solo cambios con contraparte `sm:`** — todo lo que se compacta en móvil se restaura al ritmo actual desde 640 px; desktop medido después: 2115 px y header 61 px, prácticamente idéntico (−4 px).
2. **Header de 3 filas a 2** (`app/layout.tsx` + `nav-links.tsx`): nav pasa de `flex-col` a `flex-wrap` con el bloque de enlaces en `order-last w-full` → en móvil, logo y toggle comparten fila (113 px, −36); en desktop `sm:flex-nowrap sm:order-none sm:w-auto` replica exactamente el layout anterior. Sin tocar niveles de encabezado ni contenido.
3. **GoalGrid (−162 px)**: `gap-3`, tarjeta `p-4`, icono `h-10`, `mt-2` en móvil; `sm:` devuelve `gap-4/p-5/h-11/mt-3`. **No se tocó el tamaño del H2** (escala unificada del bloque A+C: `text-xl sm:text-2xl`).
4. **Ritmos de página**: `space-y-6 sm:space-y-10`, `main py-8 sm:py-10`, hero `space-y-3 sm:space-y-4` y párrafo `text-base sm:text-lg`, HeroDemo/confianza con `p-4 sm:p-5` y `mt-2/3 sm:mt-3/4`.
5. **Sin quitar contenido**: ninguna tarjeta, texto ni enlace se eliminó; la compactación es de densidad (padding/ritmo), no de información.

### Archivos modificados
`app/layout.tsx` · `app/page.tsx` · `components/layout/nav-links.tsx` · `components/home/goal-grid.tsx` · `components/home/hero-demo.tsx` (5 archivos, ±18 líneas).

### Qué se probó y cómo (comando + resultado)
- Medición 390 px: **3216 → 2881 px (−335, −10.4 %)**; por bloque: header 149→113, hero 445→413, sección demo+confianza 662→622, módulos 1379→1217.
- Medición 1280 px: **2119 → 2115 px**, header 61 px (igual), grid 680 px (igual) → sin regresión desktop.
- `node scripts/auditar-visual.mjs http://localhost:3100 --fallo` → **0 hallazgos** (12 rutas × 4), exit=0.
- `npm run typecheck` → exit 0. `npm test` → exit 0 (178 tests).
- CI run `39714364889` → **success**.
- Producción: auditoría **0 hallazgos en 48 pasadas** + medición `medir-home.cjs` contra Pages → **2881 px @390 y 2115 px @1280** (idéntico a local).

### Errores pendientes y decisiones que requieren validación humana
- **Aceptación estética de Waldosiclla**: header móvil con logo+toggle en una fila y enlaces debajo (antes eran 3 filas); tarjetas de módulo más densas (`p-4`). Medido y verde, pero la aprobación visual es tuya (capturas: abrir `https://waldosiclla14-bit.github.io/moneya` en 390 px).
- Si se quiere bajar de 2881 px, las palancas que quedan requieren decisión de contenido (p. ej. descripciones de módulo más cortas o menos ítems visibles en móvil) — fuera de este bloque.

### Siguiente paso
Esperar dictamen de B. Otras opciones abiertas: checklist de cuota SQLite (Parte 3), O1 (Supabase real), o siguiente ciclo de contenido.

---

## 2026-10-21 · Auditoría de las páginas "con sesión" (las 5 que quedaban fuera)

### Problema (evidencia)
La puerta de calidad cubría 7 rutas públicas; `/perfil`, `/cuenta`, `/misiones`, `/onboarding` y `/simular` nunca se auditaron. Primera medición sobre esas rutas en producción: **8 hallazgos**, todos en `/misiones` (4 pasadas × cada tema/ancho): salto `H1→H3` (los títulos de misión eran `h3` sin `h2` intermedio) y borde del botón "Reiniciar progreso" `border-red-200` = **1.37:1 claro / 2.18:1 oscuro** (el override `.dark .border-red-200` de la ronda anterior tampoco alcanzaba 3:1). El mismo patrón de borde rojo existía latente en 3 botones más (`/cuenta`, `/gastos`, `/finanzas`) que no se bandean porque no renderizan en estado vacío.

Hallazgo de contexto **[verificado]**: `gh secret list` → vacío y `gh-pages.yml` inyecta `NEXT_PUBLIC_SUPABASE_URL` desde secretos → **el build de Pages corre sin Supabase** (`createClientClient()=null`); la UI con sesión (p. ej. exportar/eliminar datos en `/cuenta`) solo existe en código y no es auditable en producción.

### Decisiones tomadas y por qué
1. **Títulos de misión `h3`→`h2`**: H1 de página → H2 por ítem, sin salto de nivel.
2. **Patrón único de botón destructivo**: `border-red-200 hover:border-red-400` → `border-red-500 hover:border-red-600` en los 4 sitios. Cálculo de contraste contra los 4 fondos reales (surface/papel × claro/oscuro): rojo 500 = 3.76 / 3.57 / 3.70 / 4.42 → **único candidato ≥3:1 en todos**; rojo 600 falla en oscuro (2.88) y rojo 400 en claro (2.77).
3. **Hover en oscuro** con el mecanismo ya usado en `globals.css`: `.dark .hover\:border-red-600:hover → rgb(248 180 180)` (≈6.9:1) para que el hover también cumpla.
4. **Cobertura permanente**: las 12 rutas públicas entran al valor por defecto de `--rutas` del script → el CI audita 48 pasadas (antes 28).
5. **`--sesion` en el script de auditoría**: siembra una sesión Supabase falsa no vencida en `localStorage` (misma derivación de clave que supabase-js v2.117: `sb-<hostname[0]>-auth-token`, forma que admite `_isValidSession`, sin refresco ⇒ cero red) y **verifica** en `/cuenta` que la UI con sesión se haya renderizado (`Exportar mis datos`), fallando el build si el cliente no existe. Requiere `NEXT_PUBLIC_SUPABASE_URL` del mismo build. En CI no se usa (no hay secretos): los estados con sesión se auditan en local.

### Archivos creados/modificados
- `components/misiones/misiones-list.tsx` — `h2` + borde `red-500`.
- `components/cuenta/datos-usuario.tsx`, `components/gastos/gestor-gastos.tsx`, `components/finanzas/foto-financiera.tsx` — mismo patrón de borde destructivo.
- `app/globals.css` — alivio de hover rojo en oscuro (junto al override `border-red-200` existente, que se conserva para `metric-card`).
- `scripts/auditar-visual.mjs` — 12 rutas por defecto, flag `--sesion` + prueba de UI con sesión en `/cuenta`.

### Qué se probó y cómo (comando + resultado)
- Auditoría local A (dev, **sin sesión**, 12 rutas × claro/oscuro × 390/1280): **0 hallazgos**, exit=0 (las 8 correcciones verificadas).
- Auditoría local B (dev + env Supabase simulada, **`--sesion`**, 7 rutas × 4): **0 hallazgos**, exit=0; prueba de sesión OK (4/4) y alturas distintas confirman los estados con sesión (`/finanzas` 4003→3979, `/onboarding` 2643→2599, `/simular` 2205→2161).
- `npm run typecheck` → exit 0. `npm test` → **178/178** (32 archivos).
- CI run `39710987238` → **success** (con las 12 rutas nuevas en el job de auditoría).
- Producción `node scripts/auditar-visual.mjs --url https://waldosiclla14-bit.github.io/moneya --fallo` → **0 hallazgos en 48 pasadas**, exit=0; `/misiones` reporta "saltos: ninguno".

### Errores pendientes y decisiones que requieren validación humana
- **Decisión de Waldosiclla**: configurar secretos `SUPABASE_URL`/`SUPABASE_ANON_KEY` en GitHub para que la demo publique la UI con sesión (hoy el build sale en modo "sin Supabase"; `/login` muestra instrucciones de setup). Si se configuran, la auditoría `--sesion` podría pasar a CI con credenciales de prueba dedicadas (requiere autorización para crear usuario de prueba y secretos).
- `/misiones` sigue teniendo el contenido por encima de 4.5:1 bien, pero conviene revisión estética de títulos `h2` (heredan tamaño 20/24 de la escala unificada) — decisión visual, no de accesibilidad.

### Siguiente paso
Esperar dictamen. Opciones abiertas: **B** (compactar home móvil de 3216 px), banner/queda del checklist de cuota SQLite (Parte 3), o avanzar hacia O1 (Supabase real con RLS).

---

## 2026-10-21 · Bloque A+C: escala tipográfica única, tarjeta héroe clay y donut en /finanzas

### Problema (evidencia)
Tras la auditoría de contraste (0 hallazgos), quedaba la deuda de **diseño** medida en producción:
- Escala tipográfica rota: 11 páginas con H1 en `text-3xl` (30 px) vs home en `text-4xl/5xl` (36/48 px); H2 desde 16 px (sin tamaño, heredado) hasta 24 px — sin patrón.
- El acento clay no estructuraba nada (0.03–0.15 % de los píxeles): el dato principal de `/finanzas` (colchón) era una tarjeta neutra igual a las demás.
- `/finanzas` tenía solo números en cuadrícula; la referencia visual del usuario pide jerarquía "dato héroe + composición gráfica".

El usuario eligió por pregunta explícita: **A + C** (color con jerarquía + escala tipográfica) y **sí al donut en /finanzas**.

### Decisiones tomadas y por qué
1. **Escala tipográfica unificada por reemplazos exactos con conteo esperado** (script temporal con validación: 10 patrones, 32 coincidencias, aborta si un conteo no cuadra): H1 → `text-4xl sm:text-5xl` (36/48) idéntico al de home; H2 → `text-xl sm:text-2xl` (20/24). 11 H1 + 21 H2 en 19 archivos.
2. **Tarjeta héroe = colchón** (el "3 números" insignia de la página) con `bg-clay text-paper`: contraste **4.73:1 (claro) / 4.64:1 (oscuro)**, ambos AA. Sin opacidades en el texto del héroe (paper/80 bajaría a 3.6:1). Dato grande a 40/56 px.
3. **Chip "Enfocar colchón"** cambió de `bg-clay/10` a `bg-paper`: sobre fondo clay el 10 % sería invisible.
4. **Donut SVG puro sin dependencias** (AGENTS.md §2.9): nuevo componente `ComposicionMes` con datos **reales** de `margen` + `snapshot.debtMonthlyPayments`. La leyenda en texto es el portador accesible; el SVG es `aria-hidden`.
5. **Semántica honesta del donut**: si salidas > ingreso, el gráfico pasa a mostrar salidas (base propia) y avisa "superan tu ingreso en X"; si todo es 0, mensaje de estado vacío; valores negativos se ignoran. Segmentos con valor 0 se omiten (defaults: 3 segmentos 40/30/30, no 4).
6. **`next-env.d.ts` no se commitea**: `next dev` lo reescribe a `.next/dev/types`; se restauró a la versión de CI antes del commit.

### Archivos creados/modificados
- **Creado** `components/finanzas/composicion-mes.tsx` — donut + leyenda + fórmula.
- **Creado** `components/finanzas/__tests__/composicion-mes.test.tsx` — 4 tests (defaults, exceso, vacío, negativos).
- `components/finanzas/foto-financiera.tsx` — héroe clay, chip ajustado, sección "Composición del mes".
- 11 `app/*/page.tsx` (H1) + 7 componentes (H2): `library`, `contexto-latam`, `gestor-gastos`, `goal-grid`, `hero-demo`, `simulador-form`, `wellbeing-test`, `metodologia`, `onboarding`.

### Qué se probó y cómo (comando + resultado)
- `npm run typecheck` → **sin errores** (tras restaurar `next-env.d.ts`).
- `npm test` → **178/178** en 32 archivos (174 previos + 4 nuevos).
- `npm run auditar:visual -- --fallo` local (dev, 7 rutas × claro/oscuro × 390/1280) → **0 hallazgos, exit=0**.
- CI run `39701157220` → **success** (typecheck, build, tests, deploy, auditoría visual en Pages).
- Auditoría contra Pages → **0 hallazgos, exit=0** (28 pasadas).
- Verificación CDP objetiva contra producción (11 checks, **0 fallos**): H1=36px; héroe `rgb(180,83,42)`; dato=40px; contraste héroe=4.73:1; sección donut presente; 3 segmentos/3 filas/40-30-30; centro=1.000.000; H2=20px.
- Capturas: `Temp/opencode/moneya-shots-ac/` (local) y `.../produccion/` (8 PNG: héroe y donut en claro/oscuro, móvil/escritorio).

### Errores pendientes y decisiones que requieren validación humana
- **Aceptación estética** de Waldosiclla: escala nueva (H1 36/48, H2 20/24), héroe clay y donut — medido y verde, pero no se aprueba hasta que lo veas.
- El donut usa defaults del formulario (ingreso 1M/400k/300k); con cuotas reales aparece el 4º segmento (no probado en UI con deudas cargadas — lógica sí cubierta por test de exceso).
- `/finanzas` móvil creció de 3936 a 4003 px (nueva sección). La compactación de home (opción B) sigue pendiente y diferida.

### Siguiente paso
Esperar dictamen de A+C. Opciones abiertas: **B** (compactar home móvil de 3216 px), auditar páginas con sesión, o cerrar el checklist del banner de cuota SQLite.

---

### Problema (evidencia)
La app cumplía el contraste en apariencia, pero ninguna medición lo verificaba. Al medir el sitio **desplegado** con un navegador real (Chrome headless + CDP, script nuevo), la línea base sobre 7 páginas públicas fue:

| Métrica | Antes (producción) | Después (local, mismo script) |
|---|---|---|
| Textos con contraste < 4.5:1 — tema claro | **58** | **0** |
| Textos con contraste < 4.5:1 — tema oscuro | **83** | **0** |
| Bordes de control con contraste < 3:1 (WCAG 1.4.11) | 1–11 por página | **0** |
| Campos de formulario sin nombre accesible | 3 (en `/gastos`) | **0** |
| Saltos de encabezado (H1→H3) | 1 (en `/aprender`) | **0** |

Ejemplos de la línea base: `rgb(126,119,107)` sobre blanco = **4.43:1** (`text-neutral-500`), `rgb(164,156,140)` sobre blanco = **2.72:1** (`text-neutral-400`), borde de input `rgb(205,198,184)` = **1.7:1** (`border-neutral-300`).

### Decisiones tomadas y por qué
1. **Corregir la escala de grises, no los usos puntuales.** Los pasos 400–700 se recalibraron para que *cualquier* texto de la escala cumpla ≥ 4.5:1 sobre los fondos reales (`n200`, `n100`, `paper`, `surface`) en ambos temas. Así se corrigen ~40 usos a la vez y no depende de que alguien recuerde la regla. `n300` queda para bordes decorativos y `800+` para texto de máximo contraste.
2. **Invertir los colores de estado en tema oscuro.** `bg-white`, `bg-red-50`, `bg-emerald-50`, `text-red-600`, `text-emerald-7/8/900`, `text-amber-700` y `--muted`/`--clay-deep` son fijos en Tailwind o estaban mal calibrados: en oscuro un mensaje de error en rojo quedaba en 2.8:1 y un chip activo con `bg-neutral-900 text-white` quedaba en 1.03:1 (blanco sobre casi blanco). Ahora hay un bloque `.dark` que los invierte.
3. **Bordes de control a `neutral-500` (≥ 3:1).** Un input cuyo borde no alcanza 3:1 no cumple 1.4.11; el requisito no es estética, es que el campo se vea.
4. **Nombres accesibles con `aria-label`** en los campos que no dependían de un `<label>` envolvente (búsqueda, filtro de categoría, nueva categoría, presupuesto por categoría).
5. **Jerarquía de encabezados**: el título de cada lección pasa de `h3` a `h2` (antes había un salto H1→H3 en `/aprender`).
6. **La auditoría se vuelve puerta de calidad en CI** (job `auditoria-visual`): mide el sitio ya desplegado en Pages, en móvil 390 y escritorio 1280, en tema claro y oscuro, y deja el workflow en rojo si aparece un hallazgo. No bloquea el deploy (ocurre después).

### Archivos creados/modificados
- `scripts/auditar-visual.mjs` (nuevo) — auditoría en navegador real: contraste de cada texto, nombres accesibles, bordes de control, jerarquía de encabezados. Sin dependencias (WebSocket nativo de Node + CDP).
- `package.json` — `npm run auditar:visual`.
- `.github/workflows/gh-pages.yml` — job `auditoria-visual` (tras el deploy) + `outputs.page_url` en el job `deploy`.
- `app/globals.css` — escala neutra recalibrada (claro y oscuro), `--muted`/`--clay-deep` oscuros, bloque `.dark` para colores de estado, `.btn-secondary` con borde ≥ 3:1.
- `app/layout.tsx` — pie de página sin `/80` (perdía contraste).
- `components/aprender/library.tsx`, `components/auth/login-form.tsx`, `components/finanzas/foto-financiera.tsx`, `components/gastos/gestor-gastos.tsx`, `components/home/hero-demo.tsx`, `components/misiones/misiones-list.tsx`, `components/onboarding/perfil-form.tsx`, `components/pwa/install-prompt.tsx`, `components/simulador/simulador-form.tsx`, `components/ui/metric-card.tsx`, `components/ui/theme-toggle.tsx`, `components/wellbeing/wellbeing-test.tsx` — bordes de control, `aria-label`, h3→h2, `bg-white`→`bg-surface`.

### Qué se probó y cómo (comando + resultado)
- `node scripts/auditar-visual.mjs https://waldosiclla14-bit.github.io/moneya --tema claro` (línea base, producción): **58** textos < 4.5 y bordes < 3:1 → hallazgo confirmado en el sitio desplegado, no solo en código.
- `npm run auditar:visual -- --url http://localhost:3000 --tema claro,oscuro --ancho 390,1280 --fallo` (dev server local): **Total de hallazgos: 0** en 28 auditorías de página (7 rutas × 2 temas × 2 anchos), `exit=0`.
- `npm run typecheck` → sin errores. `npm test` → **174/174** tests en 31 archivos.

### Errores pendientes y decisiones que requieren validación humana
- **El aspecto cambió a propósito**: los grises de texto secundario (notas, metadatos, pies) ahora son más oscuros. Antes se leían como "suaves" y ahora tienen más peso. Es una decisión estética que corresponde a Waldosiclla: se puede aligerar el paso `n500` (4.43:1) solo para texto grande, **nunca** volver a 4.43:1 en texto pequeño.
- La auditoría solo cubre las 7 páginas públicas. Las que exigen sesión (`/perfil`, `/cuenta`, `/misiones`, `/onboarding`, `/simulador`) no se midieron: requieren autenticación. Pendiente medirlas con una sesión de prueba.
- `QuotaExceededError` durante una escritura real que **crezca** la base sigue sin reproducirse (ver checklist, parte 3).

### Siguiente paso
Cerrar el ciclo con push + CI (incluye el job nuevo `auditoria-visual` sobre la demo desplegada) y confirmar el resultado en `https://waldosiclla14-bit.github.io/moneya/`. Después, decidir el bloque siguiente: tipografía/jerarquía visual (escala de títulos y densidad) o medición de las páginas con sesión.

### Cierre del ciclo (2026-10-21, verificado)
- Commits: `3eaeb6c` (script de auditoría) · `971f0ee` (fix de accesibilidad) · `b9e306f` (docs) · `22cc70c` (fix de resolución de URL en CI).
- CI run `39663377460`: **build ✓ · security ✓ · deploy ✓ · Auditoria visual ✓** (primer run con el job nuevo en verde).
- Auditoría contra la **demo desplegada** (`https://waldosiclla14-bit.github.io/moneya`): **0 hallazgos** en 28 pasadas (7 rutas × tema claro/oscuro × 390/1280 px), `exit=0`.
- Capturas del resultado (para revisión visual humana): `C:\Users\LENOVO\AppData\Local\Temp\opencode\moneya-shots-nuevo\` (home móvil/escritorio en claro y oscuro, gastos, finanzas, aprender, datos).

### Lo que quedó fuera de este bloque (para el siguiente)
1. **Tipografía y jerarquía visual**: hoy el H1 mide 36 px en la home y 30 px en el resto; el H2, 18–20 px contra 16 px; y hay párrafos que llegan a 36 px (compiten con el título). Falta una escala única.
2. **Densidad**: la home móvil mide 3216 px de alto y `/finanzas` 3543 px. Medir con personas reales si compensa plegar bloques.
3. **Acento**: el color clay ocupa entre 0.03 % y 0.15 % de los píxeles; la interfaz es casi monocroma. Decidir si el acento debe guiar la mirada.
4. **Páginas con sesión** (`/perfil`, `/cuenta`, `/misiones`, `/onboarding`, `/simulador`): sin auditar porque exigen autenticación.

---

## 2026-10-20 · Paso 3 del adapter SQLite: UI de gastos conectada a la base local

### Decisiones tomadas y por qué

1. **`lib/db/gastos-repo.ts` como fachada única de la UI.** `gestor-gastos.tsx` ya no importa reducers ni `leerEstado`/`escribirEstado`: cada operación valida con los reducers puros de `lib/gastos/modelo.ts`, escribe en SQLite (unidades mínimas enteras) y **re-hidrata** desde la base — la base es la verdad. Esto resuelve de paso el redondeo CLP (pesos enteros) de forma consistente: lo que se muestra es lo que la base guarda convertido con `DECIMALES_POR_MONEDA`.
2. **Fallback local solo con `ErrorSinKvvfs`** (clase nueva en `motor.ts`): si kvvfs es imposible en el entorno (Node, jsdom) → `crearRepositorioLocal()` con el mismo contrato sobre localStorage legado; si kvvfs existe pero falla (cuota, wasm 404) → el error se propaga y la UI lo muestra (banner), **sin** respaldo silencioso — evita doble verdad y pérdida de datos cuando ya existe el marcador de migración.
3. **jsdom ≠ navegador real** (`esNavegadorReal()` en `motor.ts`): verificado en sesión — en jsdom, `init({ locateFile })` → ENOENT `C:\sqlite\sqlite3.wasm`, y sin `locateFile` carga el build `node` (`oo1.JsStorageDb` ausente). Por eso jsdom no recibe `locateFile` y `abrirBaseLocal` lanza `ErrorSinKvvfs` antes de cargar el wasm (los 4 tests del componente siguen en el modo legado y pasan sin cambios).
4. **`rowid` no existe dentro de la vista `v_tx_effective`** (sonda en sesión: `SQLITE_ERROR: no such column: rowid`; sí funciona sobre la tabla base). La hidratación consulta `transactions` con los mismos predicados que la vista (`status='confirmed' AND deleted_at IS NULL` + libro + tipo) ordenando por `occurred_on DESC, rowid DESC` (conserva el orden de inserción del mismo día); un test verifica la paridad filas/suma entre consulta directa y vista.
5. **País de la migración desde el perfil:** `paisParaMigracion()` en el componente pide el país a Supabase (`obtenerPerfil`) antes de migrar, para no crear el libro con el país por defecto mientras `RegionProvider` aún carga el perfil; sin cliente/sesión o con error → país del contexto.
6. **Presupuestos: borrado duro** (DELETE) en vez de soft-delete: `budgets` es `UNIQUE(ledger_id, category_id)` y una fila borrada lógicamente dejaría la cláusula `ON CONFLICT` sin poder recrear el presupuesto. Upsert con `ON CONFLICT DO UPDATE` sin objetivo de conflicto (SQLite ≥ 3.35; motor real 3.54.1).
7. **El literal del paquete sqlite-wasm vive solo en `vitest.setup.ts`; en navegador el ESM se sirve fuera del bundle.** Tres intentos verificados en CI/CI local (2026-10-20): (a) `fc03c46` (run 39501321016) con import literal en `motor.ts` → Turbopack siguió `gestor-gastos.tsx → motor.ts → dist/index.mjs → new Worker(new URL("sqlite3-worker1.mjs"))` y al analizar `sqlite3-worker1.mjs` chocó con `new Worker(new URL(proxyUri, …))` de opfsUtil → `Error: Module not found: Can't resolve <dynamic>` (security ✓ en ese run); (b) `576345e` (run 39502260266) con `import(modulo)` de destino dinámico → Turbopack **también** falla con `<dynamic>` (error duro, no warning); (c) `new Function('ruta', 'return import(ruta)')` evita el análisis del bundler, pero **Node/V8 rechaza `import()` dentro de `new Function`** (`TypeError: A dynamic import callback was not specified`, 12 tests locales). **Solución final:** el cargador es inyectable — `usarCargadorSqlite()`; el setup de vitest (fuera del grafo de Next) inyecta `() => import('@sqlite.org/sqlite-wasm')`, y en navegador real sin inyección `cargarMotor()` construye el import con `new Function` hacia `public/sqlite/index.mjs` (requisito: no enviar CSP con `unsafe-eval`; GitHub Pages no envía cabeceras — ADR-0001). `copy-sqlite-wasm.mjs` copia `index.mjs`, `sqlite3-worker1.mjs` y `sqlite3.wasm` a `public/sqlite/`. El build queda por verificar en CI (no ejecutable en local por RAM, AGENTS §15); la mecánica en Node quedó verificada con los 174 tests.

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `lib/db/gastos-repo.ts` (nuevo) | `RepositorioGastos` (leer/guardar/quitar/crear categoría/presupuesto), `abrirRepositorioGastos(ctx)` (abre + migra si falta marcador), `crearRepositorio(db)` (SQL), `crearRepositorioLocal()` (legado), `tzDelDispositivo()` |
| `lib/db/__tests__/gastos-repo.test.ts` (nuevo) | 10 tests: fallback sin kvvfs, round-trip migración→hidratación (`toEqual`), decimales PEN/CLP y rechazo de montos que redondean a 0, categoría desconocida sin escritura, soft-delete, sort_order y duplicados de categorías, presupuestos (upsert/update/0→borrar→recrear), paridad con `v_tx_effective`, formato de tz |
| `lib/db/motor.ts` | `ErrorSinKvvfs`, `esNavegadorReal()` (jsdom excluido de locateFile/guard kvvfs), cargador inyectable (`usarCargadorSqlite`) + `new Function` hacia `public/sqlite/index.mjs` en navegador |
| `vitest.setup.ts` (nuevo) | inyecta `() => import('@sqlite.org/sqlite-wasm')` para todos los tests (único lugar con el literal, fuera del grafo de Next) |
| `vitest.config.ts` | `setupFiles: ['./vitest.setup.ts']` |
| `scripts/copy-sqlite-wasm.mjs` | ahora copia 3 archivos: `index.mjs`, `sqlite3-worker1.mjs`, `sqlite3.wasm` → `public/sqlite/` |
| `components/gastos/gestor-gastos.tsx` | init async (país del perfil → `abrirRepositorioGastos`), `accion()` centraliza try/catch y banner de error de persistencia; sin escritura a localStorage |
| `README.md` | conteos 174/31, estado (UI conectada) |
| `db/README.md` | conteos de tests (+gastos-repo 10), estado "UI conectada", "Falta" actualizado |
| `docs/estado.md` | esta entrada |

### Qué se probó y cómo (comando + resultado)

- `npm run typecheck` → **sin errores** (2 intermedios corregidos: `SqlValue | undefined` no propagaba el narrowing a las closures → `const moneda: string`).
- `npm test` → **174 passed (174), 31 archivos** (antes: 164/30; +10 del repositorio).
- `npm run muestra` → salud del esquema OK (`integrity_check = ok`, `fk_errors = 0`, `schema_version = 0.1.0`), invariante Q1 OK.
- `node scripts/copy-sqlite-wasm.mjs` → 3 archivos copiados (656.872 + 650.116 + 879.084 bytes).
- CI run 39501321016 (push `fc03c46`) → **build falló** (Turbopack, `sqlite3-worker1.mjs:15864 Can't resolve <dynamic>`); typecheck ✓ y security ✓.
- CI run 39502260266 (push `576345e`, fix con import por expresión) → **build falló otra vez** (Turbopack, `motor.ts:70 Can't resolve <dynamic>`); security ✓.
- `new Function` + `import()` → **falló 12 tests en Node** (`A dynamic import callback was not specified`); tras la solución de inyección → **typecheck sin errores y 174 passed (174), 31 archivos**. Grep: el literal solo aparece en `vitest.setup.ts` y en `import type`/comentarios.
- Sonda de `rowid` en sesión: desde la vista → `no such column: rowid`; desde la tabla → OK (documentado en el código).
- Prueba scratch en jsdom (sesión): carga el build `node` (`libVersion 3.54.1`, `JsStorageDb` ausente); con `locateFile` → ENOENT (origen del cambio `esNavegadorReal`).
- Tests del componente `gestor-gastos` (jsdom, 4) → pasan con el fallback local, incluida la aserción de persistencia legada.

### Errores pendientes y decisiones que requieren validación humana

- **Prueba manual en navegador pendiente** (AGENTS §15): primer uso con kvvfs (migración real desde localStorage), persistencia entre recargas, `QuotaExceededError` (5 MiB), carga del wasm con `locateFile` en `next dev` y en build `export`, y que GitHub Pages sirva `index.mjs`/`sqlite3-worker1.mjs` con MIME de JavaScript (los módulos nativos lo exigen).
- **Build de Turbopack:** pendiente de confirmar en el siguiente run de CI (no ejecutable en local por RAM); el `new Function` es string, no analizable. Si aun así fallara, alternativa: `turbopack.resolveAlias` de `dist/sqlite3-worker1.mjs` a un stub.
- **CSP:** el `new Function` exige no enviar cabecera `Content-Security-Policy` con `unsafe-eval`; GitHub Pages no envía CSP (ADR-0001). Si se añade CSP (proxy propio), revisar el cargador.
- **País:** si `obtenerPerfil` falla por red, el libro se crea con el país del contexto (posible CL vs PE); un cambio de país **posterior** a la migración no re-migra ni cambia la moneda del libro (el marcador lo impide) — decisión de diseño pendiente.
- I/O síncrono de kvvfs en hilo principal (rendimiento con volúmenes grandes) sin medir.
- Bug conocido y no abordado (diferido por decisión del usuario): `lib/formato/moneda.ts:22` → `maximumFractionDigits: 0` (montos PEN sin decimales).
- ADR pendiente si el hosting cambia (OPFS requeriría otro hosting → nuevo ADR).

### Siguiente paso

**Prueba manual en navegador del Paso 3** (checklist arriba) y, con eso verde, definir con Waldosiclla el siguiente bloque (sync/backend diferido O1, o siguiente pantalla del MVP).

---

## 2026-10-20 · Paso 3 (cierre): el runtime de sqlite no llegaba al artefacto desplegado

El build de CI quedó verde (`4b85273`, run 39503503103), pero al revisar el artefacto se encontró un hueco **distinto del bug de Turbopack**:

### Decisiones tomadas y por qué

1. **`public/sqlite/` nunca estuvo commiteado** (está en `.gitignore`) y en el primer checkout de la sesión `out/` no existía, así que la verificación "build verde" **no probó** que `/sqlite/index.mjs|sqlite3-worker1.mjs|sqlite3.wasm` existiera en el artefacto. Con `basePath: /moneya` y `output: export`, el módulo se carga con `import('/moneya/sqlite/index.mjs')`; si ese archivo no está en `out/`, el import da 404 y `abrirRepositorioGastos` cae al respaldo localStorage **en silencio** (kvvfs nunca activo). Es el mismo tipo de fallo que el banner de error buscaba evitar, pero en la ruta del artefacto, no del código.
2. **Dos redes, no una:** `copy-sqlite-wasm.mjs` ahora copia a `public/sqlite/` y, si `out/` existe, también a `out/sqlite/`. El postinstall omite `out/` (`NEXT_SKIP_SQLITE_OUT=1`, vía `node -e`) para no dejar un `out/` obsoleto en artifacts/CI; en CI, tras `npm run build`, un paso `npm run sqlite:out` **refresca `out/sqlite/`** y otro paso **verifica que los 3 archivos existan** antes de subir el artefacto. Si algún día el volcado de `public/` con `basePath` fallara, el deploy no se sube en silencio: el job falla.
3. **`.gitignore`:** se añadió `out/sqlite/` explícito (aunque `out/` ya estaba) y se corrigió el comentario, que aún describía solo `sqlite3.wasm`.

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `scripts/copy-sqlite-wasm.mjs` | copia a `public/sqlite/` y a `out/sqlite/` si `out/` existe; omite `out/` con `NEXT_SKIP_SQLITE_OUT=1`; log con ruta relativa |
| `package.json` | `postinstall` fija `NEXT_SKIP_SQLITE_OUT=1`; nuevo `sqlite:out` (copia con `out/` si existe) |
| `.github/workflows/gh-pages.yml` | tras el build: `npm run sqlite:out` + paso que verifica `out/sqlite/{index.mjs,sqlite3-worker1.mjs,sqlite3.wasm}` |
| `.gitignore` | `out/sqlite/` explícito + comentario corregido |
| `README.md` | fila `sqlite:out` y nota de postinstall/build |
| `docs/estado.md` | esta entrada |

### Qué se probó y cómo (comando + resultado)

- `node scripts/copy-sqlite-wasm.mjs` (sin `out/`) → 3 archivos a `public/sqlite/` (656.872 + 650.116 + 879.084 bytes).
- `npm run postinstall` → solo `public/sqlite/` (no crea `out/`).
- Con `out/` presente → copia a `public/sqlite/` y a `out/sqlite/`; verificado con `Get-ChildItem out/sqlite` (3 archivos).
- `npm run typecheck` → sin errores; `npx vitest run` → **174 passed (174), 31 archivos**.
- `git check-ignore -v out/sqlite/index.mjs` → cubierto por `.gitignore` (sin residuo en el repo). `out/` de prueba eliminado tras verificar.

### Errores pendientes y decisiones que requieren validación humana

- **El chequeo del artefacto es de existencia, no de carga.** Solo la prueba manual en navegador (o un humo automatizado con Playwright, descartado por tamaño) confirma MIME correcto de `.mjs` y carga del wasm en Pages. Sigue pendiente.
- Sigue pendiente todo lo declarado en la entrada del Paso 3 (carrera de país, `QuotaExceededError`, kvvfs real).
- **No verifiqué en CI** el paso nuevo hasta el próximo push.

### Siguiente paso

Push y `gh run watch` para confirmar el paso de verificación del artefacto; después, prueba manual en navegador del Paso 3.

## 2026-10-20 · Paso 2 del adapter SQLite: motor sqlite-wasm + ADR-0012

### Decisiones tomadas y por qué

1. **Backend de almacenamiento: kvvfs sobre `localStorage` en hilo principal** (no OPFS). Motivo: OPFS exige cabeceras `COOP`/`COEP` que GitHub Pages no soporta — [verificado 2026-10-20] README de `@sqlite.org/sqlite-wasm` (líneas 42–44 y 140–142 en `node_modules`), `opfsUtil.vfsInstallationFeatureCheck` en `dist/index.mjs`, y la petición abierta `github.com/orgs/community/discussions/13309`. Elegido por **Waldosiclla** mediante pregunta en sesión (opción "kvvfs localStorage"). Registrado en **ADR-0012**; ADR-0011 conserva su estado anotado (backend → ADR-0012).
2. **`locateFile` solo en navegador.** Verificado en sesión: el build `node` del paquete también respeta `locateFile` y con ruta inexistente falla con ENOENT → en Node se pasa `undefined`.
3. **Cuota honesta:** 5 MiB de `localStorage` por origen — [verificado 2026-10-20] MDN, *Storage quotas and eviction criteria* (developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria, abierto en sesión); `QuotaExceededError` queda como pendiente de UI.
4. **CI prueba el motor real:** esquema, migración y transacción se ejecutan con el build `node` de `@sqlite.org/sqlite-wasm` (SQLite 3.54.1), además de los tests previos con `node:sqlite`.

### Archivos creados/modificados

| Archivo | Qué |
|---|---|
| `lib/db/motor.ts` (nuevo) | `abrirMotor()` (singleton, `locateFile` en navegador), `abrirBaseLocal()` (kvvfs + esquema si vacía, guarda sin navegador), `aplicarEsquemaSiVacia()`, `ejecutarPlan()` (transacción con rollback) |
| `lib/db/__tests__/motor.test.ts` (nuevo) | 5 tests contra el motor real |
| `scripts/copy-sqlite-wasm.mjs` (nuevo) | copia `sqlite3.wasm` → `public/sqlite/` (879.084 bytes) |
| `package.json` | `postinstall`: `node scripts/copy-sqlite-wasm.mjs` |
| `.gitignore` | `public/sqlite/` (artefacto de `node_modules`) |
| `docs/decisions/0012-backend-kvvfs-localstorage.md` (nuevo) | ADR-0012 |
| `docs/decisions/README.md` | fila 0012; estado de 0011 anotado |
| `docs/decisions/0011-...md` | solo línea de Estado (backend → ADR-0012) |
| `db/README.md` | conteos de tests (…+ motor 5), estado del motor, "Falta" actualizado |
| `README.md` | stack (sqlite-wasm), conteos 164/30, nota postinstall, estado |

### Qué se probó y cómo (comando + resultado)

- `npm run typecheck` → **sin errores**.
- `npm test` → **164 passed (164), 30 archivos** (antes: 159/29; +5 del motor).
- `npx vitest run lib/db/__tests__/motor.test.ts` → 5/5: singleton+versión; esquema (25 tablas + 2 vistas, `integrity_check = ok`, `schema_version = 0.1.0`, idempotente); migración completa con paridad de totales/presupuestos; rollback ante paso inválido; `abrirBaseLocal` rechaza fuera de navegador.
- `node scripts/copy-sqlite-wasm.mjs` → `OK sqlite3.wasm -> public/sqlite/sqlite3.wasm (879084 bytes)`.
- Pruebas manuales del paquete en Node (sesión): `init()` → SQLite 3.54.1; `oo1.DB(':memory:')` opera; `locateFile` con ruta mala → ENOENT (documentado en `motor.ts`).
- Nota: la corrección de "26 vs 25 tablas" fue por `sqlite_sequence` (interna, AUTOINCREMENT); el test ahora excluye `sqlite_%`.

### Errores pendientes y decisiones que requieren validación humana

- **Prueba manual en navegador pendiente** (no hay navegador en este entorno, AGENTS §15): kvvfs en `localStorage`, carga del wasm vía `locateFile`, copia del wasm en `next dev` y en build `export`.
- **Paso 3 (cableado UI)**: conectar `components/gastos/gestor-gastos.tsx` a `abrirBaseLocal()` + migración `moneya:gastos:v1` → tablas al primer uso, y capturar `QuotaExceededError`.
- Bug conocido y no abordado en esta tarea (diferido por decisión del usuario): `lib/formato/moneda.ts:22` usa `maximumFractionDigits: 0` → montos PEN sin decimales.
- ADR pendiente si el hosting cambia (OPFS requeriría otro hosting → nuevo ADR).

### Siguiente paso

**Paso 3 del adapter:** cablear la UI de gastos a `lib/db/motor.ts` (lectura/escritura sobre tablas + migración con marcador `migracion_gastos_v1`), con tests de las partes puras y prueba manual en navegador declarada.

---

## Checklist · Prueba manual en navegador (Paso 3) — pendiente de ejecutar

Objetivo: cubrir lo que CI no puede (MIME de `.mjs`, kvvfs real, cuota). Marcar cada casilla con la evidencia observada.

### Preparación
- [ ] Abrir la app desplegada (`https://<usuario>.github.io/moneya/`) o local (`npm run dev`).
- [ ] DevTools (F12) → pestañas **Console** y **Network** abiertas; Network filtrado por `sqlite`.
- [ ] Recargar y confirmar que la app renderiza sin errores rojos en Consola.

### 1. El runtime de sqlite se sirve bien (MIME + 200)
> **Verificado por HTTP desde la sesión (2026-10-20), no requiere navegador.** El riesgo de MIME —el que bloqueaba el despliegue— queda **descartado**:
>
> | URL | Status | content-type | bytes |
> |---|---|---|---|
> | `https://waldosiclla14-bit.github.io/moneya/sqlite/index.mjs` | 200 | `text/javascript; charset=utf-8` | 656.872 |
> | `https://waldosiclla14-bit.github.io/moneya/sqlite/sqlite3-worker1.mjs` | 200 | `text/javascript; charset=utf-8` | 650.116 |
> | `https://waldosiclla14-bit.github.io/moneya/sqlite/sqlite3.wasm` | 200 | `application/wasm` | 879.084 |
> | `https://waldosiclla14-bit.github.io/moneya/` (app) | 200 | `text/html; charset=utf-8` | 38.243 |
> | `https://moneya.vercel.app/sqlite/index.mjs` (build SSR) | 200 | `application/javascript; charset=utf-8` | — |
> | `https://moneya.vercel.app/sqlite/sqlite3.wasm` | 200 | `application/wasm` | — |
>
> Los `.mjs` se sirven como JavaScript y el `.wasm` como `application/wasm` en **ambos** despliegues → el `import()` nativo y `locateFile` deberían funcionar. Falta confirmar que el **navegador** los pida sin error (parte 2).

- [x] `GET /moneya/sqlite/index.mjs` → **200** (en local sin `/moneya`).
- [x] `GET /moneya/sqlite/sqlite3.wasm` → **200**.
- [x] `content-type` de `index.mjs` es `text/javascript` o `application/javascript` (si es `text/plain`/`application/octet-stream` → **FALLA**, el import nativo se rechaza).
- [ ] Consola sin error de import/404 de `sqlite` (por confirmar en navegador).

### 2. Migración y persistencia (base = verdad)
> **Verificado en navegador real el 2026-10-21** (Chrome headless + CDP contra la demo de Pages, no con DevTools a mano). Resultado: **cumple**.
>
> - kvvfs activo: 63 claves `kvvfs-local-*` en `localStorage`; el motor usa la base SQLite local, no el respaldo.
> - Gasto registrado (monto 12.500, nota "Prueba automatizada CDP") → aparece en la lista, **sin errores de consola**.
> - Recarga (F5) → el gasto **persiste**.
> - El legado `localStorage['moneya:gastos:v1']` queda **intacto** (la app ya no escribe ahí).
>
> **Corrección a este checklist:** el marcador de migración `migracion_gastos_v1` **no vive en `localStorage`**: se guarda en la tabla `meta` de la base SQLite (`lib/db/migracion.ts` → `IDS.marcadorMigracion`). Por eso los pasos que pedían `localStorage.getItem('migracion_gastos_v1')` estaban mal planteados: en `localStorage` siempre dará `null`.

- [x] Motor SQLite+kvvfs inicializado (claves `kvvfs-local-*` presentes).
- [x] Registrar un gasto en **Gastos** (categoría, monto, fecha) → guarda sin banner de error.
- [x] Migración aplicada: marcador `migracion_gastos_v1` presente en la tabla `meta` de SQLite.
- [x] `localStorage['moneya:gastos:v1']` → **intacto** (el legado ya no se escribe).
- [x] Recargar (F5): el gasto persiste y con los **mismos números**.

### 3. Cuota (`QuotaExceededError`) — 5 MiB
> **Parcialmente verificado el 2026-10-21.** Llenar `localStorage` hasta el límite **sí** lanza `QuotaExceededError` (en el relleno), pero la escritura posterior en kvvfs **no falló**: el motor reescribe claves de tamaño similar, así que no hay crecimiento y no se reproduce el error de cuota al guardar. El gasto escrito antes del llenado se conservó tras recargar: **no hubo pérdida silenciosa**.
>
> Lo que **queda pendiente**: un escenario donde la escritura **crezca** la base (suficientes gastos nuevos para superar el límite) para ver el banner de error real. Hoy esa ruta no está probada.

- [x] Llenar `localStorage` → `QuotaExceededError` al escribir el relleno.
- [ ] Registrar un gasto que **incremente** el tamaño → aparece **banner de error**, sin crash ni pérdida silenciosa. *(pendiente)*
- [x] Limpiar el relleno y recargar → los datos previos siguen ahí.

### Resultado (a completar por Waldosiclla)
- Fecha · entorno (Pages / local) · navegador:
- Observaciones / fallos:

### URLs de la demo
- GitHub Pages (build `export`, basePath `/moneya`): `https://waldosiclla14-bit.github.io/moneya/`
- Vercel (build SSR, `homepageUrl` del repo): `https://moneya.vercel.app/`

