-- =====================================================================
-- MONEYA · consultas clave sobre la muestra (db/muestra.sql)
-- Parámetros: :ledger :from :to :today  (fechas locales YYYY-MM-DD)
-- Mismas consultas que las documentadas en moneya_schema.sql.
-- Las ejecuta scripts/muestra-report.mjs y lib/db/__tests__/muestra.test.ts.
-- =====================================================================

-- Q1 · LIBRE HOY: saldo líquido − recurrentes que vencen en el período − aportes a metas pendientes
WITH
bal AS (SELECT COALESCE(SUM(b.balance_minor),0) AS v
        FROM v_account_balance b JOIN accounts a ON a.id = b.account_id
        WHERE b.ledger_id = :ledger AND a.include_in_safe_to_spend = 1 AND a.kind <> 'credit_card'),
upcoming AS (SELECT COALESCE(SUM(amount_minor),0) AS v FROM recurring_rules
             WHERE ledger_id = :ledger AND is_active = 1 AND deleted_at IS NULL
               AND type = 'expense' AND next_due_on BETWEEN :today AND :to),
reserved AS (SELECT COALESCE(SUM(MAX(g.monthly_contribution_minor - COALESCE(
               (SELECT SUM(t.amount_minor) FROM v_tx_effective t
                WHERE t.goal_id = g.id AND t.occurred_on BETWEEN :from AND :to), 0), 0)), 0) AS v
             FROM goals g WHERE g.ledger_id = :ledger AND g.status = 'active' AND g.deleted_at IS NULL)
SELECT bal.v AS balance_minor, upcoming.v AS upcoming_minor, reserved.v AS reserved_minor,
       bal.v - upcoming.v - reserved.v AS free_minor,
       (bal.v - upcoming.v - reserved.v)
         / MAX(CAST(julianday(:to) - julianday(:today) AS INTEGER) + 1, 1) AS per_day_minor
FROM bal, upcoming, reserved;

-- Q2 · DONA DE CATEGORÍAS (tocar segmento => filtra historial)
SELECT c.id, c.name, c.color, SUM(t.amount_minor) AS spent_minor,
       ROUND(100.0 * SUM(t.amount_minor) / SUM(SUM(t.amount_minor)) OVER (), 1) AS pct
FROM v_tx_effective t JOIN categories c ON c.id = t.category_id
WHERE t.ledger_id = :ledger AND t.type = 'expense' AND t.occurred_on BETWEEN :from AND :to
GROUP BY c.id ORDER BY spent_minor DESC;

-- Q3 · PRESUPUESTOS con estado de alerta
SELECT id, name, budget_minor, spent_minor, budget_minor - spent_minor AS left_minor, pct_used,
       CASE WHEN pct_used >= a2 THEN 'over' WHEN pct_used >= a1 THEN 'warn' ELSE 'ok' END AS state
FROM (
  SELECT b.id, c.name, b.amount_minor AS budget_minor, COALESCE(s.spent,0) AS spent_minor,
         CAST(100.0 * COALESCE(s.spent,0) / b.amount_minor AS INTEGER) AS pct_used,
         b.alert_pct_1 AS a1, b.alert_pct_2 AS a2
  FROM budgets b JOIN categories c ON c.id = b.category_id
  LEFT JOIN (SELECT category_id, SUM(amount_minor) AS spent FROM v_tx_effective
             WHERE ledger_id = :ledger AND type = 'expense' AND occurred_on BETWEEN :from AND :to
             GROUP BY category_id) s ON s.category_id = b.category_id
  WHERE b.ledger_id = :ledger AND b.deleted_at IS NULL AND b.amount_minor > 0
);

-- Q4 · BIENESTAR: deuda/ingreso y meses de colchón (libro personal, período mensual)
WITH
inc AS (SELECT COALESCE(SUM(amount_minor),0) AS v FROM v_tx_effective
        WHERE ledger_id = :ledger AND type = 'income' AND occurred_on BETWEEN :from AND :to),
debt AS (SELECT COALESCE(SUM(min_payment_minor),0) AS v FROM debts
         WHERE ledger_id = :ledger AND deleted_at IS NULL),
essential AS (SELECT COALESCE(SUM(t.amount_minor),0) AS v FROM v_tx_effective t
              JOIN categories c ON c.id = t.category_id
              WHERE t.ledger_id = :ledger AND t.type = 'expense'
                AND c.budget_class IN ('fixed','debt') AND t.occurred_on BETWEEN :from AND :to),
cushion AS (SELECT COALESCE(SUM(b.balance_minor),0) AS v FROM v_account_balance b
            JOIN accounts a ON a.id = b.account_id
            WHERE b.ledger_id = :ledger AND a.kind = 'savings')
SELECT ROUND(100.0 * debt.v / NULLIF(inc.v,0), 1) AS debt_to_income_pct,
       ROUND(1.0 * cushion.v / NULLIF(essential.v,0), 1) AS cushion_months
FROM inc, debt, essential, cushion;

-- Q5 · EMPRENDE: resultado del período (libro business)
SELECT
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount_minor END),0) AS ingresos_minor,
  COALESCE(SUM(CASE WHEN t.type = 'expense' AND COALESCE(c.cost_type,'') <> 'owner_draw' THEN t.amount_minor END),0) AS costos_minor,
  COALESCE(SUM(CASE WHEN t.type = 'expense' AND c.cost_type = 'owner_draw' THEN t.amount_minor END),0) AS retiros_dueno_minor,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount_minor
                    WHEN t.type = 'expense' AND COALESCE(c.cost_type,'') <> 'owner_draw' THEN -t.amount_minor END),0) AS utilidad_minor
FROM v_tx_effective t LEFT JOIN categories c ON c.id = t.category_id
WHERE t.ledger_id = :ledger AND t.occurred_on BETWEEN :from AND :to;
