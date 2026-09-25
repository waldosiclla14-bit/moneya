-- ============================================================================
-- MONEYA LATAM — Seed V1 (PRD secciones 10 y 17)
--   * Países (Chile, Perú)
--   * 1 ficha de fuente (Global Findex 2025) + 8 registros de indicadores
--   * Las 5 misiones del MVP
-- Regla del PRD: NO se inventan cifras. El único valor verificado es el de
-- Chile (85,1% cuenta, 2024). El resto queda en NULL hasta completar desde el
-- dataset oficial (downloaded CSV/Excel en: worldbank.org/en/publication/globalfindex/download-data).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Países
-- ---------------------------------------------------------------------------
insert into public.countries (code, name, currency_code, locale) values
    ('CL', 'Chile', 'CLP', 'es-CL'),
    ('PE', 'Perú',  'PEN', 'es-PE');

-- ---------------------------------------------------------------------------
-- Ficha de fuente (sección 10 del PRD: cada indicador con ficha completa)
-- ---------------------------------------------------------------------------
insert into public.indicator_sources (
    source_key, name, institution, edition, data_year, methodology, url, accessed_at, notes
) values (
    'global-findex-2025',
    'Global Findex Database 2025',
    'Banco Mundial (World Bank)',
    '2025 — 5ª edición',
    2024,
    'Encuesta nacional representativa de demanda (población 15+); ~145.000–148.000 adultos en 141 economías; trabajo de campo 2024. Publicado jul 2025. Uso CC BY-4.0. Cita recomendada: Klapper, L., Singer, D., Starita, L. y Norris, A. 2025. The Global Findex Database 2025: Connectivity and Financial Inclusion in the Digital Economy. World Bank, Washington, DC.',
    'https://www.worldbank.org/en/publication/globalfindex',
    '2026-09-24',
    'Valores por país descargables (Excel/CSV/Stata/Databank): https://www.worldbank.org/en/publication/globalfindex/download-data'
);

-- ---------------------------------------------------------------------------
-- Indicadores (8 filas = 4 métricas × 2 países)
-- Regla del PRD: NO se inventan cifras. La ÚNICA cifra verificada es Chile
-- 2024 "cuenta": 85,1% (Global Findex 2025). El resto queda en NULL hasta
-- completar desde el dataset oficial. En los comentarios va el código
-- Findex/WDI a buscar para rellenar sin ambigüedad.
-- ---------------------------------------------------------------------------
with s as (select id from public.indicator_sources where source_key = 'global-findex-2025')
insert into public.indicators (indicator_key, country_id, source_id, value, year, fnd_code) values
    -- Chile (country_id 1)
    ('account_ownership',        1, (select id from s), 85.10, 2024, 'account.t.d / FX.OWN.TOTL.ZS | VERIFICADO: 85.1 (2024, Global Findex 2025, World Bank, dataset oficial)'),
    ('saved_formally_last_year', 1, (select id from s), NULL, 2024, 'fin17a.17a1.d (Saved formally using an account) | TODOS: completar con valor Chile 2024'),
    ('formal_credit_access',     1, (select id from s), NULL, 2024, 'fin22a.22a1.22g.d (Borrowed from a bank or other formal financial institution) | TODOS: completar con valor Chile 2024'),
    ('emergency_funds',          1, (select id from s), NULL, 2024, 'fin11/fin44 (Could come up with extra money in 30 days / financial resilience) | TODOS: completar con valor Chile 2024'),
    -- Perú (country_id 2)
    ('account_ownership',        2, (select id from s), NULL, 2024, 'account.t.d / FX.OWN.TOTL.ZS | TODOS: completar con el valor oficial de Perú 2024 del CSV de Global Findex; no estimar'),
    ('saved_formally_last_year', 2, (select id from s), NULL, 2024, 'fin17a.17a1.d (Saved formally using an account) | TODOS: completar con valor Perú 2024'),
    ('formal_credit_access',     2, (select id from s), NULL, 2024, 'fin22a.22a1.22g.d (Borrowed from a bank or other formal financial institution) | TODOS: completar con valor Perú 2024'),
    ('emergency_funds',          2, (select id from s), NULL, 2024, 'fin11/fin44 (Could come up with extra money in 30 days / financial resilience) | TODOS: completar con valor Perú 2024');

-- ---------------------------------------------------------------------------
-- Las 5 misiones del MVP (PRD sección 17, ítem 9) — llevan por los pasos 4–6:
-- input manual de finanzas → métricas → simulaciones.
-- required_actions = claves de evento que la app marca como hechas.
-- ---------------------------------------------------------------------------
insert into public.missions (slug, title, description, sort_order, required_actions) values
    ('mi-foto-financiera', 'Mi foto financiera',
     'Guarda tu primer snapshot del mes: ingresos, gastos y lo que tienes líquido.', 1,
     '["financial_inputs.created"]'),
    ('mi-deuda-en-claro', 'Mi deuda en claro',
     'Registra al menos una deuda para saber qué parte de tu ingreso se va en cuotas.', 2,
     '["liabilities.created"]'),
    ('mis-tres-numeros', 'Mis tres números',
     'Revisa tus tres métricas: meses de cobertura, ratio de deuda y concentración de ingreso.', 3,
     '["metrics.viewed"]'),
    ('escenario-emergencia', '¿Y si perdiera mi ingreso?',
     'Simula un escenario de pérdida de ingreso y mira cuánto aguantas.', 4,
     '["simulation_created" -> scenario perdida_ingreso]'),
    ('escenario-gastos', '¿Y si mis gastos suben?',
     'Crea una segunda simulación (gastos +X% o ingresos -X%) y compara.', 5,
     '["simulation_created" -> segundo escenario]');

commit;