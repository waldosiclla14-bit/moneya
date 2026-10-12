# Registro de decisiones (ADR) — MONEYA

Registro de decisiones significativas del proyecto en formato **ADR** (Architecture Decision Record).
Cada archivo documenta **una** decisión: contexto, decisión, alternativas, consecuencias y estado.

Creado: 2026-10-12 · Origen: deuda técnica **TD-7** (`docs/audit/TECHNICAL_DEBT.md`) y preguntas abiertas **O2/O3** (`docs/audit/OPEN_QUESTIONS.md`).

## Convención

- Nombre de archivo: `NNNN-titulo-corto.md`.
- Estados permitidos: `Propuesto` · `Aceptado` · `Aceptado (provisional)` · `Reemplazado por ADR-NNNN` · `Descartado`.
- Una decisión **no se edita**: si cambia, se crea un ADR nuevo que reemplaza al anterior (y se anota el estado).
- Toda afirmación sigue las etiquetas de AGENTS.md §3.2: **[verificado]** / **[hipótesis]** / **[opinión]**.
- Las decisiones de despliegue o de datos siguen requiriendo autorización explícita (AGENTS.md §14, §3.1).

## Plantilla

```markdown
# ADR-NNNN. <Titulo>
- Estado: <estado>
- Fecha: <YYYY-MM-DD>
- Contexto: <problema y evidencia>
- Decisión: <que se decidio>
- Alternativas consideradas: <opciones y por que no>
- Consecuencias: <positivas / negativas / pendientes>
- Referencias: <archivos, lineas, docs>
```

## Indice

| ADR | Decisión | Estado |
|---|---|---|
| [0001](0001-despliegue-github-pages.md) | Despliegue estático en GitHub Pages (`output: export`) | Aceptado |
| [0002](0002-autenticacion-cliente.md) | Autenticación 100 % client-side y navegación libre con degradación | Aceptado (provisional) |
| [0003](0003-motor-financiero-determinista.md) | Motor financiero determinista; la IA explica, no calcula | Aceptado |
| [0004](0004-pwa-service-worker.md) | PWA con service worker (shell offline) | Aceptado |
| [0005](0005-locale-por-pais.md) | Locale/moneda por país vía `RegionProvider` | Aceptado |
| [0006](0006-validacion-telemetria.md) | Validación de `events.properties` (privacidad de telemetría) | Aceptado |
| [0007](0007-datos-faltantes-null.md) | Datos faltantes se representan como `null` (nunca se inventan) | Aceptado |

## Relación con las preguntas abiertas

- **O2** (Pages vs Vercel) → resuelta provisionalmente por **ADR-0001**.
- **O3** (alcance del auth) → resuelta provisionalmente por **ADR-0002**.
- **O4** (locale por país) → resuelta por **ADR-0005**.
- **O6** (policy `delete`) y **O9** (scan en CI) se documentan en `docs/audit/TECHNICAL_DEBT.md` y `SECURITY_REVIEW.md`, no como ADR.
