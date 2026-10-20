import type { EstadoGastos } from '../gastos/modelo';
import { localeDePais, monedaDePais, type CodigoPais } from '../formato/moneda';

/** Un paso SQL parametrizado; el plan completo debe ejecutarse en una transacción. */
export type PasoSql = {
  readonly sql: string;
  readonly params: readonly (string | number | null)[];
};

/**
 * Decimales por moneda. Debe coincidir con la tabla `currencies` del esquema;
 * la igualdad está garantizada por lib/db/__tests__/esquema.test.ts.
 */
export const DECIMALES_POR_MONEDA: Readonly<Record<string, number>> = Object.freeze({
  CLP: 0,
  PEN: 2,
  USD: 2,
});

/** Monto en unidades de la moneda → unidades mínimas enteras (pesos / céntimos). */
export function aUnidadesMinimas(monto: number, moneda: string): number {
  const decimales = DECIMALES_POR_MONEDA[moneda];
  if (decimales === undefined) throw new Error(`Moneda sin definir: ${moneda}`);
  return Math.round(monto * 10 ** decimales);
}

/**
 * IDs deterministas de la migración (texto, legibles).
 * La migración es de una sola ejecución: la app solo llama a planificar si
 * meta['migracion_gastos_v1'] no existe.
 */
export const IDS = {
  ledger: 'ledger-personal',
  cuenta: 'account-efectivo',
  marcadorMigracion: 'migracion_gastos_v1',
} as const;

export type ContextoMigracion = {
  pais: CodigoPais;
  /** Offset de la zona horaria del dispositivo, p. ej. '-03:00'. */
  tz: string;
  /** Marca UTC de la migración, p. ej. '2026-10-20T12:00:00.000Z'. */
  ahora: string;
};

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const TZ_RE = /^(?:Z|[+-]\d{2}:\d{2})$/;

function exigir(condicion: boolean, mensaje: string): asserts condicion {
  if (!condicion) throw new Error(`Migración cancelada: ${mensaje}`);
}

/**
 * Convierte el estado de gastos de localStorage en un plan SQL determinista.
 * Lanza Error si el estado es inconsistente (categoría inexistente, fecha o monto
 * inválidos, monto que redondea a 0 unidades mínimas): mejor no migrar que migrar mal.
 *
 * No inventa saldo: la cuenta creada lleva include_in_safe_to_spend = 0 porque este
 * módulo no modela ingresos ni saldos; v_account_balance queda en 0 (verificado en tests).
 */
export function planificarMigracionGastos(
  estado: EstadoGastos,
  ctx: ContextoMigracion,
): PasoSql[] {
  const moneda = monedaDePais(ctx.pais);
  exigir(DECIMALES_POR_MONEDA[moneda] !== undefined, `moneda sin definir (${moneda}).`);
  exigir(TZ_RE.test(ctx.tz), `zona horaria inválida (${ctx.tz}).`);
  exigir(!Number.isNaN(Date.parse(ctx.ahora)), `marca de tiempo inválida (${ctx.ahora}).`);
  exigir(estado.categorias.length > 0, 'el estado no tiene categorías.');
  exigir(new Set(estado.categorias.map((c) => c.id)).size === estado.categorias.length, 'categorías con id duplicado.');

  const categoriasValidas = new Set<string>();
  for (const c of estado.categorias) {
    exigir(c.id.trim().length > 0, 'categoría sin id.');
    exigir(c.label.trim().length > 0, `categoría "${c.id}" sin nombre.`);
    categoriasValidas.add(c.id);
  }

  const categoriaHuerfana = Object.keys(estado.presupuestos).find((id) => !categoriasValidas.has(id));
  exigir(categoriaHuerfana === undefined, `presupuesto de categoría inexistente (${categoriaHuerfana}).`);

  const pasos: PasoSql[] = [];
  const ahora = ctx.ahora;

  // Perfil: dispositivo, no inventado (país/locale/tz provistos por la app).
  pasos.push({
    sql: `INSERT INTO app_profile (id, display_name, country, locale, timezone, base_currency,
            period_kind, period_start_day, ai_enabled, ai_allow_images, biometric_lock,
            sync_enabled, created_at, updated_at)
          VALUES (1, NULL, ?, ?, ?, ?, 'monthly', 1, 0, 0, 0, 0, ?, ?)
          ON CONFLICT(id) DO NOTHING`,
    params: [ctx.pais, localeDePais(ctx.pais), ctx.tz, moneda, ahora, ahora],
  });

  pasos.push({
    sql: `INSERT INTO ledgers (id, kind, name, country, currency, is_archived, created_at, updated_at, deleted_at)
          VALUES (?, 'personal', 'Personal', ?, ?, 0, ?, ?, NULL)
          ON CONFLICT(id) DO NOTHING`,
    params: [IDS.ledger, ctx.pais, moneda, ahora, ahora],
  });

  // Cuenta contable sin saldo: este módulo no registra ingresos ni saldos.
  pasos.push({
    sql: `INSERT INTO accounts (id, ledger_id, institution_id, name, kind, currency, last4,
            opening_balance_minor, credit_limit_minor, billing_day, due_day,
            include_in_safe_to_spend, is_archived, created_at, updated_at, deleted_at)
          VALUES (?, ?, NULL, 'Efectivo', 'cash', ?, NULL, 0, NULL, NULL, NULL, 0, 0, ?, ?, NULL)
          ON CONFLICT(id) DO NOTHING`,
    params: [IDS.cuenta, IDS.ledger, moneda, ahora, ahora],
  });

  estado.categorias.forEach((categoria, indice) => {
    pasos.push({
      sql: `INSERT INTO categories (id, ledger_id, parent_id, name, type, budget_class, cost_type,
              icon, color, sort_order, is_archived, created_at, updated_at, deleted_at)
            VALUES (?, ?, NULL, ?, 'expense', NULL, NULL, NULL, NULL, ?, 0, ?, ?, NULL)
            ON CONFLICT(id) DO NOTHING`,
      params: [categoria.id, IDS.ledger, categoria.label, indice, ahora, ahora],
    });
  });

  for (const [categoriaId, monto] of Object.entries(estado.presupuestos)) {
    const minor = aUnidadesMinimas(monto, moneda);
    exigir(monto > 0, `presupuesto no positivo en ${categoriaId}.`);
    pasos.push({
      sql: `INSERT INTO budgets (id, ledger_id, category_id, amount_minor, alert_pct_1, alert_pct_2,
              rollover, created_at, updated_at, deleted_at)
            VALUES (?, ?, ?, ?, 80, 100, 0, ?, ?, NULL)
            ON CONFLICT(id) DO NOTHING`,
      params: [`budget-${categoriaId}`, IDS.ledger, categoriaId, minor, ahora, ahora],
    });
  }

  for (const gasto of estado.gastos) {
    exigir(FECHA_RE.test(gasto.fecha) && !Number.isNaN(Date.parse(gasto.fecha)), `fecha inválida (${gasto.fecha}).`);
    exigir(Number.isFinite(gasto.monto) && gasto.monto > 0, `monto inválido en ${gasto.fecha}.`);
    exigir(categoriasValidas.has(gasto.categoriaId), `gasto con categoría inexistente (${gasto.categoriaId}).`);
    const minor = aUnidadesMinimas(gasto.monto, moneda);
    exigir(minor > 0, `el monto ${gasto.monto} ${moneda} redondea a 0 unidades mínimas.`);
    pasos.push({
      sql: `INSERT INTO transactions (id, ledger_id, type, amount_minor, currency, account_id,
              to_account_id, to_amount_minor, fee_minor, category_id, goal_id, party_id,
              recurring_rule_id, linked_tx_id, title, merchant, notes, occurred_at, occurred_tz,
              occurred_on, status, source, capture_id, confidence, dedupe_key, bank_ref,
              document_type_id, document_number, tax_amount_minor, tax_included,
              created_at, updated_at, deleted_at)
            VALUES (?, ?, 'expense', ?, ?, ?, NULL, NULL, 0, ?, NULL, NULL, NULL, NULL,
              NULL, NULL, ?, ?, ?, ?, 'confirmed', 'manual', NULL, NULL, NULL, NULL,
              NULL, NULL, NULL, NULL, ?, ?, NULL)
            ON CONFLICT(id) DO NOTHING`,
      params: [
        `tx-${gasto.id}`,
        IDS.ledger,
        minor,
        moneda,
        IDS.cuenta,
        gasto.categoriaId,
        gasto.nota.trim() || null,
        // 12:00 UTC es el marcador neutro de "solo fecha": la app no tiene horas.
        `${gasto.fecha}T12:00:00.000Z`,
        ctx.tz,
        gasto.fecha,
        ahora,
        ahora,
      ],
    });
  }

  pasos.push({
    sql: `INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    params: [IDS.marcadorMigracion, ahora],
  });

  return pasos;
}
