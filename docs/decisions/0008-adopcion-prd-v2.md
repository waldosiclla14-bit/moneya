# ADR-0008. Adopción del PRD V2 como especificación vigente

- Estado: Aceptado
- Fecha: 2026-10-13
- Contexto:
  - El dueño aportó `MONEYA_LATAM_PRD_V2.md` (auditoría estratégica + product spec, 24-09-2026) como contexto de trabajo — [verificado] (documento recibido en sesión).
  - Verificación de alineación en sesión (solo lectura): el repo ya cumple el núcleo del PRD — CFPB 10 ítems con tramos 18–61/62+ (`lib/cfpb/items.ts`), métricas separadas sin índice compuesto (`analizarSnapshot`), 4 indicadores LATAM fijos (`lib/datos`), Supabase + RLS (migraciones 0001–0006), motor determinista con fórmulas visibles, telemetría sin valores financieros (`validarPropiedades`), 5 misiones, lenguaje sin culpa ni garantías (grep limpio en `components/`) — [verificado].
- Decisión:
  - El PRD V2 es la especificación vigente para scope y reglas no negociables (§20: cálculos puros en `lib/calculos`, fórmula visible por resultado, RLS desde la primera migración, lenguaje condicional, `indicators` solo Global Findex 2025 vía `indicator_sources`, regla ética anti-culpa, eventos sin valores financieros).
  - Lo ya implementado no se reconstruye; las brechas se trabajan como backlog (`docs/product/BACKLOG_PRD_V2.md`).
  - Los datos de mercado (§5) y la revisión legal (§14) quedan como [supuestos del doc] / pendientes externos: no se afirman como verificados ni se actúa sobre ellos sin abogado.
- Alternativas consideradas:
  - **No adoptar formalmente (solo archivar):** rechazado; el equipo necesita una spec única para decidir scope.
  - **Re-auditar todo antes de adoptar:** rechazado; el núcleo ya se verificó y el resto está acotado en el backlog.
- Consecuencias:
  - Positivas: scope cerrado (MVP §17), decisiones de producto trazables, brechas con criterio de aceptación.
  - Negativas / pendientes: backlog B1–B6 por verificar/cerrar; revisión legal externa sigue pendiente.
- Referencias: `docs/product/BACKLOG_PRD_V2.md`, `docs/audit/TECHNICAL_DEBT.md`, ADRs 0001–0007.
