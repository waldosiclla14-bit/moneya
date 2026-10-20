-- =====================================================================
-- MONEYA · esquema v0.1
-- Motor: SQLite (sqlite-wasm + OPFS en la PWA). Sync opcional vía sync_outbox.
-- Convenciones:
--   · IDs: TEXT (UUIDv7 generado en la app)
--   · Dinero: INTEGER en unidades mínimas (CLP=0 decimales, PEN=2) + columna currency
--   · Fechas: *_at = UTC ISO-8601; occurred_on = FECHA LOCAL del usuario (evita bugs de zona horaria)
--   · Borrado lógico: deleted_at. Todo contador/lista sale de v_tx_effective (misma fuente)
--   · NUNCA se guardan credenciales tributarias/bancarias ni números completos de cuenta/tarjeta
-- =====================================================================
PRAGMA foreign_keys = ON;

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO meta VALUES ('schema_version', '0.1.0');

-- ---------- 1. Catálogos ----------
CREATE TABLE currencies (
  code TEXT PRIMARY KEY, decimals INTEGER NOT NULL, symbol TEXT NOT NULL
);
INSERT INTO currencies VALUES ('CLP',0,'$'),('PEN',2,'S/'),('USD',2,'US$');

CREATE TABLE exchange_rates (
  base TEXT NOT NULL REFERENCES currencies(code),
  quote TEXT NOT NULL REFERENCES currencies(code),
  on_date TEXT NOT NULL, rate REAL NOT NULL, source TEXT,
  PRIMARY KEY (base, quote, on_date)
);

CREATE TABLE institutions (
  id TEXT PRIMARY KEY,                       -- 'cl-bci', 'pe-bcp'
  country TEXT NOT NULL CHECK (country IN ('CL','PE')),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('bank','wallet','fintech','card_issuer','cash')),
  parser_status TEXT NOT NULL DEFAULT 'none' CHECK (parser_status IN ('none','beta','stable'))
);
-- Semillas provisionales (revisar antes de publicar)
INSERT INTO institutions (id,country,name,kind) VALUES
 ('cl-bancochile','CL','Banco de Chile','bank'),('cl-bancoestado','CL','BancoEstado','bank'),
 ('cl-santander','CL','Santander','bank'),('cl-bci','CL','BCI','bank'),
 ('cl-scotiabank','CL','Scotiabank','bank'),('cl-itau','CL','Itaú','bank'),
 ('cl-falabella','CL','Banco Falabella','bank'),('cl-mach','CL','Mach','fintech'),
 ('cl-tenpo','CL','Tenpo','fintech'),('cl-mercadopago','CL','Mercado Pago','wallet'),
 ('pe-bcp','PE','BCP','bank'),('pe-interbank','PE','Interbank','bank'),
 ('pe-bbva','PE','BBVA Perú','bank'),('pe-scotiabank','PE','Scotiabank Perú','bank'),
 ('pe-mibanco','PE','Mibanco','bank'),('pe-yape','PE','Yape','wallet'),('pe-plin','PE','Plin','wallet');

-- Catálogos legales: VACÍOS a propósito. Se pueblan desde docs/emprede/FORMALIZATION_*.md
-- (regla del spec: no inventar requisitos, costos ni plazos; registrar fecha de consulta)
CREATE TABLE tax_regimes (
  id TEXT PRIMARY KEY, country TEXT NOT NULL CHECK (country IN ('CL','PE')),
  code TEXT NOT NULL, name TEXT NOT NULL,
  source_url TEXT NOT NULL, consulted_on TEXT NOT NULL, notes TEXT,
  UNIQUE (country, code)
);
CREATE TABLE document_types (                -- boleta, factura, honorarios, etc.
  id TEXT PRIMARY KEY, country TEXT NOT NULL CHECK (country IN ('CL','PE')),
  code TEXT NOT NULL, name TEXT NOT NULL,
  source_url TEXT NOT NULL, consulted_on TEXT NOT NULL,
  UNIQUE (country, code)
);

-- Plantillas de categorías (se copian al crear un libro)
CREATE TABLE category_templates (
  id INTEGER PRIMARY KEY, ledger_kind TEXT NOT NULL CHECK (ledger_kind IN ('personal','business')),
  name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('income','expense')),
  budget_class TEXT CHECK (budget_class IN ('fixed','variable','saving','debt')),
  cost_type TEXT CHECK (cost_type IN ('cogs','opex','payroll','tax','capex','owner_draw')),
  icon TEXT, color TEXT
);
INSERT INTO category_templates (ledger_kind,name,type,budget_class,cost_type) VALUES
 ('personal','Arriendo / Hipoteca','expense','fixed',NULL),
 ('personal','Servicios básicos','expense','fixed',NULL),
 ('personal','Mercado','expense','variable',NULL),
 ('personal','Restaurantes','expense','variable',NULL),
 ('personal','Transporte','expense','variable',NULL),
 ('personal','Salud','expense','variable',NULL),
 ('personal','Educación','expense','fixed',NULL),
 ('personal','Suscripciones','expense','fixed',NULL),
 ('personal','Gasto hormiga','expense','variable',NULL),
 ('personal','Ocio','expense','variable',NULL),
 ('personal','Ahorro','expense','saving',NULL),
 ('personal','Deudas y cuotas','expense','debt',NULL),
 ('personal','Sueldo','income',NULL,NULL),
 ('personal','Honorarios / Freelance','income',NULL,NULL),
 ('personal','Retiro del negocio','income',NULL,NULL),
 ('personal','Otros ingresos','income',NULL,NULL),
 ('business','Ventas','income',NULL,NULL),
 ('business','Otros ingresos','income',NULL,NULL),
 ('business','Costo de ventas','expense','variable','cogs'),
 ('business','Publicidad','expense','variable','opex'),
 ('business','Software y herramientas','expense','fixed','opex'),
 ('business','Arriendo / Coworking','expense','fixed','opex'),
 ('business','Sueldos y honorarios pagados','expense','fixed','payroll'),
 ('business','Comisiones de plataformas','expense','variable','opex'),
 ('business','Envíos y logística','expense','variable','opex'),
 ('business','Impuestos y contribuciones','expense','fixed','tax'),
 ('business','Equipamiento','expense','variable','capex'),
 ('business','Retiro del dueño','expense',NULL,'owner_draw');

-- ---------- 2. Perfil, privacidad y libros ----------
CREATE TABLE app_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  display_name TEXT,
  country TEXT NOT NULL CHECK (country IN ('CL','PE')),
  locale TEXT NOT NULL DEFAULT 'es-CL',
  timezone TEXT NOT NULL DEFAULT 'America/Santiago',
  base_currency TEXT NOT NULL DEFAULT 'CLP' REFERENCES currencies(code),
  period_kind TEXT NOT NULL DEFAULT 'monthly'
    CHECK (period_kind IN ('monthly','biweekly','annual','custom')),
  period_start_day INTEGER NOT NULL DEFAULT 1 CHECK (period_start_day BETWEEN 1 AND 28), -- 15 => del 15 al 14
  ai_enabled INTEGER NOT NULL DEFAULT 0,          -- IA es opt-in
  ai_allow_images INTEGER NOT NULL DEFAULT 0,
  biometric_lock INTEGER NOT NULL DEFAULT 0,
  sync_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

-- Un libro por contexto: personal y uno por cada negocio (Emprende)
CREATE TABLE ledgers (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('personal','business')),
  name TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('CL','PE')),
  currency TEXT NOT NULL REFERENCES currencies(code),
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

CREATE TABLE business_profiles (
  ledger_id TEXT PRIMARY KEY REFERENCES ledgers(id),
  trade_name TEXT, legal_name TEXT,
  tax_id TEXT,                                    -- RUT/RUC opcional; sin claves ni accesos
  tax_regime_id TEXT REFERENCES tax_regimes(id),
  formalization_stage TEXT NOT NULL DEFAULT 'informal'
    CHECK (formalization_stage IN ('informal','in_progress','formal')),
  sector TEXT, started_on TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE formalization_steps (               -- checklist por negocio (fuente + fecha de consulta)
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  step_code TEXT NOT NULL, title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done','na')),
  due_on TEXT, done_on TEXT, source_url TEXT, consulted_on TEXT, notes TEXT,
  updated_at TEXT NOT NULL, UNIQUE (ledger_id, step_code)
);

CREATE TABLE parties (                           -- clientes y proveedores (Emprende)
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  kind TEXT NOT NULL CHECK (kind IN ('customer','supplier','both')),
  name TEXT NOT NULL, tax_id TEXT, email TEXT, phone TEXT, notes TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

-- ---------- 3. Cuentas, categorías, metas, deudas ----------
CREATE TABLE accounts (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  institution_id TEXT REFERENCES institutions(id),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('cash','checking','savings','credit_card','wallet','other')),
  currency TEXT NOT NULL REFERENCES currencies(code),
  last4 TEXT CHECK (last4 IS NULL OR length(last4) = 4),   -- solo últimos 4
  opening_balance_minor INTEGER NOT NULL DEFAULT 0,
  credit_limit_minor INTEGER, billing_day INTEGER, due_day INTEGER,
  include_in_safe_to_spend INTEGER NOT NULL DEFAULT 1,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  parent_id TEXT REFERENCES categories(id),
  name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('income','expense')),
  budget_class TEXT CHECK (budget_class IN ('fixed','variable','saving','debt')),
  cost_type TEXT CHECK (cost_type IN ('cogs','opex','payroll','tax','capex','owner_draw')),
  icon TEXT, color TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

CREATE TABLE goals (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  name TEXT NOT NULL, icon TEXT,
  target_minor INTEGER NOT NULL CHECK (target_minor > 0),
  monthly_contribution_minor INTEGER NOT NULL DEFAULT 0,  -- se reserva en "Libre hoy"
  target_on TEXT, account_id TEXT REFERENCES accounts(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','done','paused')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

CREATE TABLE debts (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  name TEXT NOT NULL, creditor TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('credit_card','consumer','mortgage','auto','education','informal','other')),
  principal_minor INTEGER, balance_minor INTEGER NOT NULL,
  rate_bps INTEGER, min_payment_minor INTEGER NOT NULL DEFAULT 0, due_day INTEGER,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

-- ---------- 4. Transacciones ----------
CREATE TABLE transactions (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL REFERENCES currencies(code),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),        -- solo transfer
  to_amount_minor INTEGER,                           -- transfer entre monedas
  fee_minor INTEGER NOT NULL DEFAULT 0,
  category_id TEXT REFERENCES categories(id),
  goal_id TEXT REFERENCES goals(id),                 -- aporte a meta
  party_id TEXT REFERENCES parties(id),
  recurring_rule_id TEXT REFERENCES recurring_rules(id),
  linked_tx_id TEXT REFERENCES transactions(id),     -- retiro del negocio <-> ingreso personal
  title TEXT, merchant TEXT, notes TEXT,
  occurred_at TEXT NOT NULL,                         -- UTC
  occurred_tz TEXT NOT NULL,
  occurred_on TEXT NOT NULL                          -- fecha local, base de períodos y estadísticas
    CHECK (occurred_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','pending_review')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN
    ('manual','ai_text','ai_voice','ai_photo','paste_list','shortcut_sms','shortcut_push',
     'shortcut_email','apple_pay','share_sheet','recurring','import_csv')),
  capture_id TEXT REFERENCES capture_inbox(id),
  confidence REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  dedupe_key TEXT,                                   -- hash(cuenta, monto, minuto, comercio)
  bank_ref TEXT,
  -- Emprende (solo ledger business)
  document_type_id TEXT REFERENCES document_types(id),
  document_number TEXT,
  tax_amount_minor INTEGER, tax_included INTEGER,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT,
  CHECK (type <> 'transfer' OR to_account_id IS NOT NULL)
);
CREATE UNIQUE INDEX ux_tx_dedupe ON transactions (ledger_id, dedupe_key) WHERE dedupe_key IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX ix_tx_period   ON transactions (ledger_id, occurred_on);
CREATE INDEX ix_tx_category ON transactions (category_id, occurred_on);
CREATE INDEX ix_tx_account  ON transactions (account_id);
CREATE INDEX ix_tx_goal     ON transactions (goal_id);

CREATE TABLE transaction_items (                 -- líneas de recibo leídas por IA
  id TEXT PRIMARY KEY, transaction_id TEXT NOT NULL REFERENCES transactions(id),
  description TEXT NOT NULL, quantity REAL NOT NULL DEFAULT 1,
  unit_minor INTEGER, total_minor INTEGER NOT NULL,
  category_id TEXT REFERENCES categories(id)
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY, transaction_id TEXT NOT NULL REFERENCES transactions(id),
  kind TEXT NOT NULL CHECK (kind IN ('receipt','invoice','other')),
  opfs_path TEXT NOT NULL, sha256 TEXT, mime TEXT, size_bytes INTEGER,
  created_at TEXT NOT NULL
);

-- ---------- 5. Planificación ----------
CREATE TABLE budgets (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  alert_pct_1 INTEGER NOT NULL DEFAULT 80, alert_pct_2 INTEGER NOT NULL DEFAULT 100,
  rollover INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT,
  UNIQUE (ledger_id, category_id)
);

CREATE TABLE recurring_rules (
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('subscription','bill','salary','rent','installment','other')),
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount_minor INTEGER NOT NULL, amount_is_estimate INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL REFERENCES currencies(code),
  account_id TEXT REFERENCES accounts(id), category_id TEXT REFERENCES categories(id),
  party_id TEXT REFERENCES parties(id),
  rrule TEXT NOT NULL,                              -- RFC 5545
  next_due_on TEXT NOT NULL, remind_days_before INTEGER NOT NULL DEFAULT 2,
  auto_post INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);

-- ---------- 6. Captura y automatización ----------
CREATE TABLE capture_inbox (                     -- todo lo que entra antes de ser transacción
  id TEXT PRIMARY KEY, ledger_id TEXT NOT NULL REFERENCES ledgers(id),
  channel TEXT NOT NULL CHECK (channel IN
    ('text','voice','photo','paste','shortcut_sms','shortcut_push','shortcut_email',
     'apple_pay','share_sheet','import_csv')),
  institution_id TEXT REFERENCES institutions(id),
  raw_payload TEXT, payload_sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN
    ('new','parsed','needs_review','accepted','rejected','duplicate')),
  parsed_json TEXT, confidence REAL, error TEXT,
  purge_after TEXT,                                -- TTL: el texto crudo no vive para siempre
  created_at TEXT NOT NULL, processed_at TEXT
);

CREATE TABLE parser_rules (                      -- biblioteca abierta de parsers por banco
  id TEXT PRIMARY KEY, institution_id TEXT NOT NULL REFERENCES institutions(id),
  channel TEXT NOT NULL CHECK (channel IN ('sms','push','email')),
  version INTEGER NOT NULL DEFAULT 1,
  pattern TEXT NOT NULL, field_map TEXT NOT NULL,  -- regex + mapeo JSON (monto, comercio, fecha, tipo)
  sample TEXT, source TEXT NOT NULL DEFAULT 'builtin' CHECK (source IN ('builtin','community','user')),
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE ai_events (                         -- transparencia: qué salió del dispositivo
  id TEXT PRIMARY KEY, at TEXT NOT NULL,
  provider TEXT NOT NULL, model TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('parse_text','parse_voice','parse_receipt','insight')),
  input_kind TEXT NOT NULL CHECK (input_kind IN ('text','audio','image')),
  bytes_sent INTEGER NOT NULL, redacted INTEGER NOT NULL DEFAULT 0,
  capture_id TEXT REFERENCES capture_inbox(id)
);

CREATE TABLE sync_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, row_id TEXT NOT NULL,
  op TEXT NOT NULL CHECK (op IN ('upsert','delete')), payload TEXT,
  created_at TEXT NOT NULL, synced_at TEXT
);

-- ---------- 7. Vistas (única fuente de verdad) ----------
CREATE VIEW v_tx_effective AS
  SELECT * FROM transactions WHERE status = 'confirmed' AND deleted_at IS NULL;

CREATE VIEW v_account_balance AS
SELECT a.id AS account_id, a.ledger_id, a.currency,
  a.opening_balance_minor
  + COALESCE((SELECT SUM(CASE t.type WHEN 'income' THEN t.amount_minor ELSE -t.amount_minor END)
              FROM v_tx_effective t WHERE t.account_id = a.id AND t.type IN ('income','expense')), 0)
  - COALESCE((SELECT SUM(t.amount_minor + t.fee_minor)
              FROM v_tx_effective t WHERE t.account_id = a.id AND t.type = 'transfer'), 0)
  + COALESCE((SELECT SUM(COALESCE(t.to_amount_minor, t.amount_minor))
              FROM v_tx_effective t WHERE t.to_account_id = a.id AND t.type = 'transfer'), 0)
  AS balance_minor
FROM accounts a WHERE a.deleted_at IS NULL;

-- =====================================================================
-- CONSULTAS CLAVE (parámetros: :ledger :from :to :today, fechas locales YYYY-MM-DD)
-- =====================================================================

-- Q1 · LIBRE HOY: saldo líquido − recurrentes que vencen en el período − aportes a metas pendientes
--      (limitación: usa un solo vencimiento por regla; para quincenales expandir el rrule en la app)
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
