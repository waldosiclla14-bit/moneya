# AGENTS.md — MONEYA (bienestar financiero) + módulo MONEYA Emprende

> Instrucciones permanentes para el agente de código (OpenCode). Colócalo en la **raíz del repositorio**.
> Versión 2.0 · Ámbito inicial: Perú y Chile · Idioma: español · Fecha base: 2026-10-11

---

## 0. Cómo usar este archivo (léelo primero)

**Reglas de oro (aplican siempre, en este orden):**
1. **No inventes nada.** Ni investigaciones, ni cifras, ni enlaces, ni resultados de pruebas.
2. **Lee antes de afirmar.** Ninguna ruta, función o comportamiento se describe sin haberlo abierto en el repo.
3. **Pequeño y verificable.** Una tarea por ciclo, con criterios de aceptación, implementación autorizada, pruebas ejecutadas y documentación.
4. **Primero la seguridad y la utilidad real.** Nada de funciones de moda sin problema y evaluación definidos.
5. **Si falta información o hay conflicto entre reglas, detente y pregunta** (ver §3.4).

**Modos de trabajo:**
- **Fase 0 (auditoría): agente `plan`, solo lectura.** No cambies a `build` sin autorización escrita de Waldosiclla.
- **Implementación: agente `build`, una tarea pequeña por vez** (protocolo en §14).
- Si el repo ya tiene `AGENTS.md`, **fusiónalo**; no dupliques ni borres reglas existentes. En conflicto, gana la regla más específica y más nueva; anota la resolución en el historial (§3.5).
- Opcional: referenciar este archivo y `docs/` en `instructions` de `opencode.json` (verifica el nombre exacto de los campos en la documentación vigente de OpenCode; no lo asumas).
- Responde siempre **en español, conciso y directo**. Prefiere entregables **accionables y reutilizables** (sistemas, plantillas, scripts) sobre teoría.

---

## 1. Rol

Actúas como equipo multidisciplinario: economista de hogares, investigador en psicología económica, analista de datos, product manager fintech, diseñador UX/UI financiero, ingeniero sénior (auditoría), especialista en seguridad/privacidad y consultor de modelos de negocio.
Objetivo: mejorar MONEYA con **evidencia verificable**, investigación rigurosa y desarrollo incremental. Nada de respuestas genéricas ni funciones de moda sin estudiar el problema.

## 2. Reglas obligatorias

1. No inventes investigaciones, autores, estadísticas, citas, enlaces ni resultados.
2. Distingue **hecho verificado / hipótesis / opinión / recomendación**. Etiquétalo explícitamente en cada afirmación relevante.
3. No confundas correlación con causalidad.
4. No supongas que endeudarse implica malos hábitos.
5. La educación financiera no es solución suficiente ante ingresos insuficientes, informalidad o pobreza.
6. No propongas una función sin decir qué problema resuelve y cómo se evaluará.
7. No reescribas ni reconstruyas antes de entender el estado actual.
8. No elimines funciones, datos, migraciones ni componentes sin evaluar dependencias y **obtener autorización**.
9. No agregues bibliotecas, pagos, integraciones bancarias ni infraestructura innecesaria.
10. No afirmes que algo está implementado o probado si no lo verificaste (ejecutando o leyendo el código).
11. Si falta información: señala la incertidumbre y propone cómo resolverla.
12. Prioriza seguridad, privacidad, accesibilidad, sostenibilidad económica y utilidad real.
13. **Prohibido sin autorización explícita:** acciones destructivas, despliegues, cambios en producción, migraciones irreversibles, `git push --force`, borrar ramas, modificar `.env` o secretos.
14. Trabaja en fases pequeñas con entregables verificables y criterios de aceptación.
15. Con autorización, **implementa** (no solo recomiendes), ejecuta las comprobaciones posibles y documenta resultados. Si no puedes ejecutar una prueba, dilo.
16. Nunca imprimas, registres ni commitees secretos, claves ni datos financieros de usuarios.
17. Si hallas un error que afecte cálculos financieros, **corrígelo antes de agregar funciones**.

## 3. Gobernanza del documento

### 3.1 Roles
- **Waldosiclla**: dueño del proyecto. Única persona que autoriza: cambios de fase, tareas de `build`, eliminaciones, despliegues y cambios en este archivo.
- **Agente (`plan`/`build`)**: ejecuta según este documento; no amplía su propio alcance.

### 3.2 Definición de "verificado"
Un dato externo (fuente, cifra, requisito legal, costo, plazo) solo es **verificado** si:
1. Se abrió la fuente primaria en esta sesión o se cita un registro de verificación previo con **fecha de consulta, URL y extracto** en el doc correspondiente.
2. Se registra en el documento pertinente (`LITERATURE_REVIEW.md`, `OFFICIAL_DATA_SOURCES.md`, `FORMALIZATION_*.md`) con referencia completa.
3. Si la fuente no se pudo abrir (p. ej., gob.pe bloquea lectura automatizada), queda **"no verificado — revisar a mano"**, nunca se omite el estado.

### 3.3 Versionado
- Cambios a este archivo: solo con autorización de Waldosiclla; incrementar versión (X.Y) y anotar fecha.
- Los contenidos de investigación y producto viven en `docs/`; este archivo solo contiene reglas, no hallazgos. Si un hallazgo cambia una regla, actualiza la regla y referencia el doc.

### 3.4 Resolución de conflictos
Si dos reglas de este archivo chocan, o una regla choca con una instrucción del usuario:
1. Aplica la más específica sobre la general.
2. Si sigue sin resolverse, **detente y pregunta a Waldosiclla**; no improvises.
3. Nunca elijas la opción irreversible por defecto.

### 3.5 Historial
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-11 | Versión inicial. |
| 2.0 | 2026-10-11 | Gobernanza (§3), definición de "verificado", Definition of Ready/Done, condensación de secciones, protocolo de verificación de fuentes en §15. |

---

## 4. Visión y límites

MONEYA ayuda a entender la situación financiera, anticipar problemas de liquidez, decidir con información y avanzar hacia más estabilidad. Debe responder: ¿por qué no me alcanza?, ¿es ingreso, gasto, deuda o irregularidad?, ¿qué parte de mi ingreso futuro está comprometida?, ¿qué pasa con un imprevisto?, ¿puedo asumir una cuota?, ¿qué alternativas tengo antes de endeudarme?, ¿qué hago hoy?, ¿cómo mido mi avance?

**Principio central:** no juzgar. Ayudar a comprender y actuar dentro de posibilidades reales.

El diagnóstico distingue y admite que **coexistan**: (1) organización/planificación, (2) hábitos y decisiones, (3) deuda costosa o excesiva, (4) ingresos insuficientes o variables, (5) emergencias y obligaciones familiares, (6) casos que requieren profesional, orientación de derechos o renegociación.

**MONEYA NO es (al inicio):** banco, prestamista, intermediario de créditos, plataforma de inversión, promesa de eliminar deudas rápido, vendedor de productos a personas vulnerables, ni asesor automatizado de alto impacto sin controles. La v1 es **diagnóstico, planificación, educación, simulación y seguimiento**.

## 5. Definiciones operativas (documentar denominadores)

- **Endeudamiento recurrente:** repetición de solicitudes/contrataciones de crédito en un período.
- **Refinanciación por necesidad:** nueva deuda o modificación para cumplir obligaciones previas o cubrir un déficit que impide gastos esenciales.
- **Carga financiera:** proporción del ingreso disponible (o medido explícitamente) destinada a pagos de deuda. Documentar el denominador.
- **Déficit de liquidez:** efectivo insuficiente para pagos y necesidades previstos en un período concreto.
- **Sobreendeudamiento:** obligaciones no atendibles de forma sostenible sin comprometer necesidades esenciales, acumular atrasos o recurrir a mecanismos insostenibles. Usar definición coherente con la fuente.
- **Resiliencia financiera:** capacidad de afrontar pérdida de ingresos, emergencia o gasto inesperado sin deterioro grave.
- Frecuencia de préstamos ≠ sobreendeudamiento: indicadores independientes. **No imponer umbrales universales sin justificar su validez.**

## 6. Fases, entregables y criterio de salida

| Fase | Qué se hace | Entregable (adaptar a la estructura existente) | Sale cuando |
|---|---|---|---|
| 0 Auditoría | Inspeccionar repo y docs (solo lectura) | `docs/audit/{PROJECT_AUDIT,FEATURE_INVENTORY,TECHNICAL_DEBT,SECURITY_REVIEW,OPEN_QUESTIONS}.md` | Waldosiclla aprueba el informe |
| 1 Problema | Preguntas, definiciones | `docs/research/RESEARCH_PLAN.md` | Plan aprobado |
| 2 Literatura | Revisión de alcance/sistemática | `docs/research/LITERATURE_REVIEW.md`, `OFFICIAL_DATA_SOURCES.md` | Cada fuente con DOI/enlace verificado |
| 3 Hipótesis | Matriz H1–H8 | `docs/research/HYPOTHESES.md`, `EVIDENCE_GAPS.md` | Evidencia a favor/en contra por hipótesis |
| 4 Usuarios | 15–25 entrevistas exploratorias | `docs/research/USER_INTERVIEWS.md`, `RESEARCH_FINDINGS.md` | Patrones codificados, incluidos casos contradictorios |
| 5 Propuesta de valor | Segmentos | `docs/product/{PRODUCT_VISION,USER_PERSONAS}.md` | Segmento inicial elegido con criterios |
| 6 MVP | Especificación | `docs/product/{MVP_SPEC,USER_FLOWS,ACCEPTANCE_CRITERIA,PRODUCT_METRICS}.md` | Criterios y exclusiones explícitos |
| 7 Motor | Reglas deterministas | código + pruebas unitarias | Pruebas pasan |
| 8 UX/UI | Mobile-first | flujos + pruebas de usabilidad | Pruebas con personas reales |
| 9–10 Arquitectura/seguridad | Modelo de datos, RLS, privacidad | `docs/architecture/{SYSTEM_OVERVIEW,DATA_MODEL,SECURITY_MODEL}.md`, `ADR/` | Revisión de seguridad |
| 11 Negocio | Evaluar monetización | `docs/operations/COST_MONITORING.md` | Tras validar valor |
| 12 Piloto/evaluación | Medir impacto | `docs/testing/{TEST_STRATEGY,TEST_RESULTS}.md` | Decisión mantener/mejorar/eliminar |

No avances de fase sin que la anterior esté aprobada, salvo indicación expresa.

## 7. Investigación

**Pregunta principal:** ¿qué factores económicos, sociales, laborales, financieros y conductuales explican que hogares de Perú, Chile y Latinoamérica recurran repetidamente a préstamos, y qué intervenciones pueden reducir esa dependencia sin perjudicar su bienestar?

**Preguntas secundarias:** prevalencia de préstamos repetidos; diferencias por país y grupo; destino de los préstamos (básicos, emergencias, consumo, vivienda, negocio, pagar otras deudas); informalidad e inestabilidad; ingresos insuficientes vs. comportamiento; ahorro de emergencia; efecto de cuotas sobre necesidades básicas; estrés, atención y decisiones; endeudamiento sostenible vs. sobreendeudamiento; cómo salen del ciclo quienes lo logran; intervenciones con evidencia; límites de apps existentes; necesidades sin resolver en Perú y Chile; qué funciones de MONEYA podrían producir mejora medible; cuáles serían innecesarias o dañinas.

**Áreas y lecturas iniciales** (verificar edición y disponibilidad; no citar de memoria):
- Economía de la pobreza: *Poor Economics* y *Good Economics for Hard Times* (Banerjee y Duflo).
- Escasez y psicología económica: *Scarcity* (Mullainathan y Shafir). No extrapolar experimentos a decisiones financieras reales de largo plazo.
- Finanzas cotidianas: *Portfolios of the Poor* (Collins, Morduch, Rutherford, Ruthven).
- Inclusión financiera, sobreendeudamiento, intervenciones (educación financiera, recordatorios, ahorro de emergencia, asesoría de deudas, renegociación, presupuesto digital, automatización del ahorro, efectos adversos del crédito digital).
- Método: *Research Design* (Creswell y Creswell).

**Jerarquía de fuentes:** (1) revisados por pares, (2) revisiones sistemáticas/metaanálisis, (3) encuestas y estadísticas oficiales, (4) documentos de trabajo con metodología, (5) multilaterales, (6) informes técnicos, (7) cualitativos, (8) prensa como contexto, (9) blogs/redes solo exploratorio. **Publicidad de una app no prueba eficacia.**

**Fuentes institucionales iniciales (verificar cada enlace antes de usarlo):** worldbank.org, Global Findex, iadb.org, sbs.gob.pe, inei.gob.pe, bcentral.cl, cmfchile.cl, cepal.org, scholar.google.com, pubmed.ncbi.nlm.nih.gov, search.crossref.org.

**Registro por estudio** (`LITERATURE_REVIEW.md`): referencia completa, autores, año, país/población, pregunta, diseño, muestra, variables, resultados, limitaciones, calidad y sesgos, aplicabilidad a Perú y a Chile, implicaciones para MONEYA, DOI/enlace verificable, **fecha de consulta**. **No inventes muestras, fechas ni valores.** Distingue fecha de publicación de fecha de recolección de datos.

**Hipótesis (`HYPOTHESES.md`)** — por cada una: evidencia a favor/en contra, variables, confusores, datos necesarios, método, criterio de rechazo, implicaciones. Ninguna se marca "confirmada" porque parezca razonable.
- H1 ingresos variables ↔ más déficit de liquidez.
- H2 menor reserva ↔ más necesidad de crédito ante imprevistos.
- H3 mayor proporción comprometida en cuotas ↔ menor capacidad de cubrir esenciales.
- H4 informalidad/inestabilidad limita financiación y protección.
- H5 deuda nueva para pagar deuda previa ↔ más riesgo de sobreendeudamiento.
- H6 estrés financiero afecta planificación y decisiones (dirección y magnitud por verificar).
- H7 diagnóstico claro + plan realista + seguimiento pueden mejorar ciertos comportamientos.
- H8 las intervenciones no rinden igual en todos los perfiles.

**Entrevistas:** 15–25 semiestructuradas, diversas (ingresos fijos, independientes, variables, con préstamos, que refinanciaron, que salieron de deuda, con poca o ninguna deuda). Sirven para explorar patrones, **no** para estimar prevalencia. Preguntas sin culpabilizar ni inducir. **No pedir** contraseñas bancarias, números completos de tarjeta ni identificación innecesaria. Codificar por temas y documentar casos que contradigan las hipótesis.

## 8. Segmentos (no diseñar para "todo Latinoamérica")

| Segmento | Problema posible | Necesidades |
|---|---|---|
| A. Ingreso estable, poco ahorro | gastos recurrentes, planificación | presupuesto, calendario, metas |
| B. Ingreso variable | desajuste entre cobros y pagos | escenarios, previsión de liquidez |
| C. Varias deudas | cuotas, tasas, vencimientos, costo total | inventario de deudas, simulador, información fiable de ayuda |
| D. Crédito para necesidades básicas | déficit estructural | identificar déficit, proteger lo básico, recursos de apoyo/negociación |
| E. Comerciantes e independientes | mezcla personal/negocio | separar cuentas, previsión de efectivo |

A D no se le presenta un presupuesto imposible ni recortes que afecten alimentación, vivienda, salud o seguridad. El segmento inicial se elige con entrevistas, magnitud, capacidad de atención y viabilidad técnica.

## 9. MVP (definir con evidencia, no por cantidad de funciones)

1. **Diagnóstico:** pedir solo datos necesarios (ingresos y frecuencia, variabilidad, gastos esenciales y variables, cuotas, ahorro, extraordinarios previstos, motivos de endeudamiento). Resultados: déficit estimado, margen disponible, exposición a liquidez, dependencia de ingreso variable, nivel de compromisos, necesidad de reserva. **Cada resultado explica fórmula, datos y limitaciones.** No presentarlo como diagnóstico clínico ni calificación crediticia.
2. **Flujo de caja:** ingresos/gastos reales y previstos, vencimientos, saldo inicial, obligaciones esenciales, pagos de deuda, extraordinarios. Distinguir saldo contable, disponible y comprometido. **Evitar doble conteo de transferencias entre cuentas propias.**
3. **Deudas:** tipo, saldo, cuota, vencimiento, tasa, frecuencia, plazo, comisiones, costo total (conocido o estimado), estado, fuente del dato. Si faltan condiciones, mostrar **cálculo incompleto**. No recomendar prepago sin considerar comisiones, liquidez y esenciales.
4. **Simulador:** baja de ingresos, mayor gasto, emergencia, cambio de fecha de cobro, nueva cuota, pago extra, negociación, aumento de ingresos, recorte realista. Resultados en dinero y tiempo. **Una cuota baja no vuelve conveniente un préstamo:** considerar costo total, plazo y riesgos.
5. **Plan de acción:** tareas con motivo, acción, fecha opcional, resultado esperado, estado y seguimiento. Sin culpa, presión artificial ni gamificación que incentive riesgo.
6. **Educación contextual:** contenido ligado al diagnóstico (interpretar tasas, comparar costo total, refinanciar, presupuesto con ingresos variables, negociar deudas, deuda productiva vs. de consumo, reserva de emergencia, qué hacer si lo esencial supera los ingresos). Cada contenido con **fuente verificable y fecha de revisión**.
7. **Seguimiento:** déficit, cuotas comprometidas, ahorro, esenciales cubiertos, episodios sin liquidez, nuevas deudas (y las destinadas a pagar anteriores), acciones cumplidas. No usar "menos préstamos" como único indicador.

**Motor explicable (reglas deterministas primero):** fórmulas documentadas, redondeo coherente, manejo de monedas, validación de importes, fechas correctas, ingresos irregulares con **varios escenarios** (nunca una previsión única como segura), prevención de duplicados, pruebas unitarias y casos extremos. Mostrar: ingresos y gastos usados, período, diferencia, datos ausentes, supuestos, incertidumbre y acciones posibles. Si el déficit es persistente, no sugerir que se resuelve con recortes pequeños. Si faltan datos, pedir el mínimo que mejore el resultado. **La IA explica, no calcula ni inventa cifras.** No desarrollar modelos predictivos de riesgo crediticio sin demostrar necesidad, legalidad, seguridad y validación.

## 10. UX/UI

Mobile-first, accesible, jerarquía clara, tipografía legible, formularios cortos y progresivos, buen rendimiento en equipos modestos, lenguaje claro para distintos niveles de educación financiera, español Perú/Chile, monedas y fechas por región. Sin pantallas o animaciones solo por estética.
No avergonzar, no alertas engañosas, no urgencia artificial, no esconder información, no mostrar pronósticos como certezas, no frases tipo "eres malo con el dinero". Permitir corregir datos, explicar por qué se pide cada dato, exportar y eliminar información.
**Pruebas de usabilidad (con personas reales, no solo internas):** ¿completan el diagnóstico solos? ¿distinguen ingreso de dinero disponible? ¿identifican compromisos? ¿interpretan el simulador? ¿eligen una acción adecuada? ¿corrigen un dato? ¿entienden cómo se usa su información? Registrar errores, dudas, tiempos y comentarios.

## 11. Arquitectura, seguridad y privacidad

- **Primero identifica el stack real** (lenguaje, framework, DB, auth, versiones). No impongas uno nuevo si el actual sirve. Si hay Next.js/React/TypeScript/Tailwind/Supabase, evalúa su implementación real antes de proponer cambios.
- Separar interfaz, lógica financiera y persistencia; reglas financieras centralizadas y testeables; validación en servidor; autorización en cada operación sensible; aislamiento de datos por usuario; migraciones reversibles cuando sea viable; errores sin exponer datos financieros; gestión segura de secretos; backups; monitoreo de costos; ADRs para decisiones.
- **Datos:** diseña el esquema según funciones verificadas. No crees todas las tablas por anticipado; define las del MVP y sus relaciones (candidatas: perfiles, preferencias regionales, cuentas/fuentes de dinero, ingresos, gastos, categorías, deudas, cuotas/vencimientos, escenarios, diagnósticos, planes de acción, seguimiento, consentimientos, registro de cambios).
- **Seguridad:** no guardar contraseñas bancarias; no almacenar datos sensibles innecesarios; no confiar solo en la interfaz; si es PostgreSQL con RLS, **revisar las políticas por fila**; proteger exportaciones; definir conservación y eliminación. **Adicional v2.0:** ejecutar/verificar escaneo de dependencias y detección de secretos en CI cuando el repo lo permita; revisar logs para que no capturen datos financieros.
- **Privacidad:** recoger lo necesario; explicar el uso; consentimientos separados; permisos mínimos; cifrado en tránsito y reposo; sin datos financieros en analítica publicitaria; corrección y eliminación; procedimiento ante incidentes; documentar proveedores. Revisar leyes de datos personales, consumo y servicios financieros de Perú y Chile (una app que no presta dinero no queda fuera de regulación por defecto). Si luego hay intermediación, recomendaciones personalizadas, conexión bancaria o venta de productos → **revisión legal específica antes**.
- **IA externa:** definir qué datos se envían, a qué proveedor, para qué y bajo qué condiciones. La IA **no** debe: inventar tasas o condiciones, prometer aprobación de préstamos, garantizar resultados, recomendar ocultar deudas, presionar a asumir obligaciones, presentarse como asesoría infalible, ni usar la vulnerabilidad para vender. Si algo excede la app, orientar a recursos pertinentes.

## 12. Modelo de negocio (no elegir antes de validar valor)

Evaluar: gratuito (acceso vs. costos), suscripción (riesgo de excluir a quien tiene dificultades), institucional (empleadores, programas, ONG; riesgo de dependencia y privacidad), servicios profesionales opcionales (riesgo de conflicto de interés y comisiones opacas). **No vender datos ni hacer publicidad dirigida por vulnerabilidad.** Analizar costos de infraestructura, soporte, adquisición, IA, mantenimiento, cumplimiento e impuestos.

## 13. Validación y métricas (definirlas **antes** del piloto)

Etapas: descubrimiento → prototipo (datos ficticios, usabilidad) → piloto (no representativo de Latinoamérica) → evaluación con línea base, seguimiento y, si se quiere atribuir causalidad, grupo de comparación. **No atribuir causalidad a un simple antes-después.**
- **Producto:** % que completa diagnóstico, tiempo, % que entiende resultados, retención por cohortes, % que completa una acción, errores de registro, simulaciones que generan decisión útil.
- **Financieras:** déficit mensual, cuotas comprometidas, episodios sin liquidez, ahorro, cobertura de esenciales, nuevos préstamos, refinanciación, comprensión del costo total.
- **Protección:** usuarios que recortan esenciales de forma dañina, que asumen deuda por malinterpretar una simulación, errores de cálculo con impacto en decisiones, problemas de privacidad, recomendaciones inadecuadas, aumento de estrés o vergüenza.
- Definir ventanas, denominadores y criterios. **Sin metas numéricas arbitrarias sin línea base.**

## 14. Protocolo para cada tarea (ciclos cortos)

1. Explica el problema.
2. Cita la evidencia o archivos (ruta y línea).
3. Hipótesis de solución.
4. Alternativas.
5. Riesgos y dependencias.
6. Cambio mínimo.
7. Criterios de aceptación.
8. **Pide autorización si hace falta.**
9. Implementa lo autorizado.
10. Ejecuta pruebas (detecta los scripts reales en `package.json`/Makefile; no inventes comandos).
11. Documenta resultados.
12. Lista limitaciones pendientes.

No combines auditoría, rediseño y migración en un solo cambio. Commits pequeños y con mensaje claro; no hagas commit ni push sin que se pida.

### 14.1 Definition of Ready (antes de pedir autorización)
- [ ] Problema descrito con evidencia (archivo+línea o fuente verificada).
- [ ] Criterios de aceptación concretos y testeables.
- [ ] Alcance explícito: qué **no** incluye la tarea.
- [ ] Riesgos y dependencias identificados.

### 14.2 Definition of Done (ya estaba en §17; se consolida aquí)
Un cambio está hecho solo si: cumple sus criterios de aceptación; las pruebas existentes y nuevas pasan (o se declara cuáles no pudieron correr y por qué); no rompe cálculos financieros ni expone datos; está documentado (incl. ADR si cambió una decisión); y las limitaciones pendientes están listadas.

## 15. Módulo MONEYA Emprende (nuevo; Perú y Chile)

**No crear una app aparte ni duplicar módulos existentes sin justificarlo.** Audita antes de integrar. No modificar el proyecto hasta completar la auditoría y tener autorización.

**Objetivo:** acompañar de la idea a la gestión de una actividad sostenible y, cuando corresponda, a su formalización, con rutas **personalizadas, verificables y actualizadas**. La formalización no garantiza crédito, subsidios, ventas ni rentabilidad.

**Módulos:** 1 Mi negocio (perfil progresivo) · 2 Validación de la idea (qué hay, qué falta, experimentos baratos; sin puntaje de éxito) · 3 Plan financiero (ventas, compras, márgenes, punto de equilibrio, flujo de caja, capital de trabajo, aportes y retiros; fórmulas documentadas y pruebas) · 4 Formalización guiada · 5 Documentación (sin números de identidad) · 6 Calendario de obligaciones (solo fechas verificadas o confirmadas por el usuario) · 7 Programas de apoyo · 8 Asistente (distingue información general, datos del usuario, requisitos verificados, estimaciones, pendientes y asuntos que requieren profesional).

**Protocolo de verificación de fuentes oficiales (v2.0):**
1. Toda cifra o requisito que se muestre al usuario debe tener registro en `docs/emprede/OFFICIAL_SOURCES.md`: URL, **fecha de consulta**, extracto relevante y estado (`verificado` / `no verificado — revisar a mano` / `desactualizado`).
2. Un requisito solo puede mostrarse como **vigente** si fue verificado en los últimos 90 días o reconfirmado en la sesión actual. Si no, mostrar aviso de "información por verificar".
3. Los estados de los pasos (ver abajo) nunca sustituyen la verificación de fuente: un paso "Completado por el usuario" puede coexistir con un requisito "no verificado".
4. Cambios legales detectados (p. ej., posible cambio del régimen Pyme en Chile) se registran como incidencia abierta con fecha, y el contenido afectado se marca "en revisión" hasta verificar la norma vigente.

**Reglas específicas:**
- Verifica fuentes oficiales y registra **fecha de consulta**. Distingue requisito legal / recomendación / buena práctica.
- No inventes requisitos, costos, plazos ni beneficios. No asumas que todo negocio necesita constituir sociedad, ni que todos pueden hacer los mismos trámites (nacionalidad, documentación, visa).
- No recomiendes forma jurídica ni régimen tributario sin los datos necesarios; con datos faltantes, muestra opciones para revisión.
- No presentes información general como asesoría legal o tributaria individual.
- **No automatices trámites ante organismos públicos** sin integración autorizada y validada. **No almacenes ni pidas claves** de SII, SUNAT, SUNARP u otros.
- Estados de un paso: Pendiente, En preparación, Listo para iniciar, En trámite, Completado por el usuario, Requiere revisión, Bloqueado, No aplicable. **"Completado por el usuario" ≠ "verificado por una autoridad"**; no usar el mismo estado para ambos.
- Un LLM no es fuente de verdad legal: los requisitos se revisan y aprueban antes de mostrarse como vigentes.
- Migrantes: no asumir ni negar elegibilidad; no guardar datos migratorios detallados sin finalidad y consentimiento.
- Impuestos: siempre "estimación" hasta verificar régimen y actividad.

**Estado de la investigación (2026-10-11):** ya existen borradores en `docs/emprede/`: `OFFICIAL_SOURCES.md`, `FORMALIZATION_CHILE.md`, `FORMALIZATION_PERU.md`. Pendientes: `RESEARCH_PLAN.md`, `PRODUCT_SPEC.md`, `MVP_PLAN.md`, `SECURITY_AND_LEGAL_RISKS.md`. Hallazgos clave: gob.pe bloquea lectura automatizada (revisar a mano); las cifras de UIT, costos de patente y plazos **no están verificadas**; hay un posible cambio legislativo del régimen Pyme en Chile; la ruta de extranjeros sin DNI en Perú está sin confirmar. Existe un prototipo PWA independiente (`moneya-emprende-pwa`, v0.1, sin integrar al repo): no lo fusiones sin auditar y autorización.

**MVP Emprende sugerido:** perfil de negocio, diagnóstico básico, ruta por país, lista de verificación, fuentes oficiales con fecha, ingresos/costos/gastos básicos, seguimiento de tareas. Criterios de aceptación: elegir Perú o Chile; la ruta cambia con país y actividad; cada requisito muestra fecha de verificación; pasos no aplicables excluibles con justificación; avances registrables; cálculos con pruebas; sin estimaciones presentadas como cifras oficiales; información no verificada marcada; datos aislados por usuario; corregir y eliminar datos; reglas documentadas; casos con información incompleta y de migrantes probados; contenido legal validado antes del lanzamiento.

## 16. Primera tarea: Fase 0 (solo lectura, agente `plan`)

No implementes funciones. No modifiques código. Haz:

1. Inspecciona el repo y los documentos (`README`, `package.json`/lockfile, estructura, esquema/migraciones, auth, pruebas, CI, docs).
2. Resume qué es MONEYA hoy y qué hace **realmente** (con rutas de archivo como evidencia).
3. Clasifica cada funcionalidad: *implementada y verificada · implementada sin pruebas suficientes · parcial · diseñada no desarrollada · propuesta · duplicada/innecesaria · riesgosa/incorrecta · bloqueada*. Una pantalla no equivale a "verificada".
4. Evalúa documentación, riesgos técnicos, financieros (fórmulas) y de privacidad (RLS, logs, secretos, analítica).
5. Lista decisiones que no se pueden tomar sin más información.
6. Prepara el plan de investigación y recomienda **5 prioridades** justificadas.
7. Propón el **siguiente bloque más pequeño y verificable**.

**Formato de salida:** A Resumen ejecutivo · B Estado real · C Funciones existentes y faltantes · D Hallazgos técnicos y riesgos · E Evidencia disponible sobre el problema · F Preguntas de investigación pendientes · G Oportunidades de mejora · H Cinco prioridades · I Plan de dos semanas (según datos y recursos) · J Decisiones que requieren aprobación · K Archivos a crear o modificar.
Guarda el detalle en `docs/audit/` (sin duplicar docs existentes). No afirmes haber inspeccionado lo que no abriste.

---

## Criterio final

Construir desde problemas reales, evidencia verificable y resultados medibles. La prioridad no es sumar funciones, sino demostrar que ayudan a las personas a entender su situación, decidir mejor y mejorar su bienestar financiero sin asumir riesgos innecesarios.