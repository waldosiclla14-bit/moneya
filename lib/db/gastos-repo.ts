import type { Database } from '@sqlite.org/sqlite-wasm';
import {
  ESTADO_VACIO,
  actualizarPresupuesto,
  agregarCategoria,
  agregarGasto,
  eliminarGasto,
  escribirEstado,
  leerEstado,
  type Categoria,
  type EstadoGastos,
  type Gasto,
} from '../gastos/modelo';
import {
  DECIMALES_POR_MONEDA,
  IDS,
  aUnidadesMinimas,
  planificarMigracionGastos,
  type ContextoMigracion,
} from './migracion';
import { ErrorSinKvvfs, abrirBaseLocal, ejecutarPlan } from './motor';

/**
 * Repositorio de gastos sobre la base local (kvvfs en localStorage, ADR-0012).
 *
 * La UI ya no habla con localStorage ni con los reducers directamente: cada
 * operación valida con los reducers de `lib/gastos/modelo.ts`, escribe en la
 * base y **re-hidrata** el estado desde la base (la base es la verdad). Esto
 * aplica los decimales de la moneda de forma consistente: la base guarda
 * unidades mínimas enteras (pesos CLP / céntimos PEN) y al leer se convierten
 * a unidades de la moneda con `DECIMALES_POR_MONEDA`.
 *
 * En entornos sin kvvfs (build node, jsdom de tests) `abrirRepositorioGastos`
 * devuelve `crearRepositorioLocal()`: mismas operaciones persistiendo en
 * localStorage (modo legado). Ese respaldo solo se activa cuando kvvfs es
 * imposible (`ErrorSinKvvfs`); cualquier otro fallo (cuota, wasm) se propaga
 * para que la UI lo muestre en vez de ocultarlo con una verdad alternativa.
 */

export type RepositorioGastos = {
  leer(): EstadoGastos;
  guardarGasto(input: {
    fecha: string;
    monto: number;
    categoriaId: string;
    nota?: string;
  }): EstadoGastos;
  quitarGasto(id: string): EstadoGastos;
  crearCategoria(label: string): EstadoGastos;
  definirPresupuesto(categoriaId: string, monto: number): EstadoGastos;
};

/** Unidades mínimas enteras → unidades de la moneda (redondeo a 2 decimales visible). */
function aDecimal(minor: number, decimales: number): number {
  return Math.round((minor / 10 ** decimales) * 100) / 100;
}

/** Offset de zona horaria del dispositivo en formato ±HH:MM (para occurred_tz). */
export function tzDelDispositivo(): string {
  const minutos = -new Date().getTimezoneOffset();
  const signo = minutos >= 0 ? '+' : '-';
  const abs = Math.abs(minutos);
  const horas = String(Math.floor(abs / 60)).padStart(2, '0');
  const resto = String(abs % 60).padStart(2, '0');
  return `${signo}${horas}:${resto}`;
}

/**
 * Abre la base local y deja el repositorio de gastos listo. Si es la primera
 * vez (falta meta['migracion_gastos_v1']), migra el estado legado de
 * localStorage —o el estado vacío base si no hay nada— con el país, la zona
 * horaria y la marca de tiempo provistas por la app.
 */
export async function abrirRepositorioGastos(ctx: ContextoMigracion): Promise<RepositorioGastos> {
  let db: Database;
  try {
    db = await abrirBaseLocal();
  } catch (error) {
    if (error instanceof ErrorSinKvvfs) return crearRepositorioLocal();
    throw error;
  }

  const marcador = db.selectValue('SELECT value FROM meta WHERE key = ?', [IDS.marcadorMigracion]);
  if (marcador === undefined) {
    const estadoLocal = leerEstado() ?? { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
    ejecutarPlan(db, planificarMigracionGastos(estadoLocal, ctx));
  }
  return crearRepositorio(db);
}

/**
 * Repositorio SQL: exige que el perfil y el libro personal existan (recién
 * creados por la migración o por otro proceso) y que la moneda del libro esté
 * definida en `DECIMALES_POR_MONEDA`.
 */
export function crearRepositorio(db: Database): RepositorioGastos {
  const tz = db.selectValue('SELECT timezone FROM app_profile WHERE id = 1');
  const monedaLeida = db.selectValue('SELECT currency FROM ledgers WHERE id = ?', [IDS.ledger]);
  if (typeof tz !== 'string' || typeof monedaLeida !== 'string') {
    throw new Error('Repositorio de gastos: falta el perfil o el libro personal (¿migración pendiente?).');
  }
  // Copia tipada: el narrowing del typeof no llega a las funciones internas.
  const moneda: string = monedaLeida;
  const decimales = DECIMALES_POR_MONEDA[moneda];
  if (decimales === undefined) throw new Error(`Repositorio de gastos: moneda sin definir (${moneda}).`);

  const ahora = () => new Date().toISOString();

  function leer(): EstadoGastos {
    const categorias: Categoria[] = db
      .selectObjects(
        'SELECT id, name FROM categories WHERE ledger_id = ? AND type = ? AND deleted_at IS NULL ORDER BY sort_order',
        [IDS.ledger, 'expense'],
      )
      .map((fila) => ({ id: String(fila.id), label: String(fila.name) }));

    // Mismos predicados que la vista v_tx_effective (status/deleted) más libro y
    // tipo. Se consulta la tabla base porque rowid no es accesible desde la vista
    // (verificado 2026-10-20: "no such column: rowid"); el orden por rowid
    // conserva el orden de inserción dentro del mismo día. La paridad con la
    // vista la verifica gastos-repo.test.ts.
    const gastos: Gasto[] = db
      .selectObjects(
        `SELECT id, occurred_on, amount_minor, category_id, notes
           FROM transactions
          WHERE ledger_id = ? AND type = 'expense' AND status = 'confirmed' AND deleted_at IS NULL
          ORDER BY occurred_on DESC, rowid DESC`,
        [IDS.ledger],
      )
      .map((fila) => {
        const id = String(fila.id);
        return {
          id: id.startsWith('tx-') ? id.slice(3) : id,
          fecha: String(fila.occurred_on),
          monto: aDecimal(Number(fila.amount_minor), decimales),
          categoriaId: String(fila.category_id ?? ''),
          nota: String(fila.notes ?? ''),
        };
      });

    const presupuestos: Record<string, number> = {};
    for (const fila of db.selectObjects(
      'SELECT category_id, amount_minor FROM budgets WHERE ledger_id = ? AND deleted_at IS NULL',
      [IDS.ledger],
    )) {
      presupuestos[String(fila.category_id)] = aDecimal(Number(fila.amount_minor), decimales);
    }

    return { categorias, gastos, presupuestos };
  }

  function guardarGasto(input: {
    fecha: string;
    monto: number;
    categoriaId: string;
    nota?: string;
  }): EstadoGastos {
    // El reducer valida fecha, monto > 0 y categoría conocida.
    const siguiente = agregarGasto(leer(), input);
    const gasto = siguiente.gastos[0];
    const minor = aUnidadesMinimas(gasto.monto, moneda);
    if (minor <= 0) throw new Error(`El monto redondea a 0 ${moneda}.`);
    const ts = ahora();
    db.exec(
      `INSERT INTO transactions (id, ledger_id, type, amount_minor, currency, account_id,
              to_account_id, to_amount_minor, fee_minor, category_id, goal_id, party_id,
              recurring_rule_id, linked_tx_id, title, merchant, notes, occurred_at, occurred_tz,
              occurred_on, status, source, capture_id, confidence, dedupe_key, bank_ref,
              document_type_id, document_number, tax_amount_minor, tax_included,
              created_at, updated_at, deleted_at)
        VALUES (?, ?, 'expense', ?, ?, ?, NULL, NULL, 0, ?, NULL, NULL, NULL, NULL,
              NULL, NULL, ?, ?, ?, ?, 'confirmed', 'manual', NULL, NULL, NULL, NULL,
              NULL, NULL, NULL, NULL, ?, ?, NULL)`,
      {
        bind: [
          `tx-${gasto.id}`,
          IDS.ledger,
          minor,
          moneda,
          IDS.cuenta,
          gasto.categoriaId,
          gasto.nota.trim() || null,
          // 12:00 UTC es el marcador neutro de "solo fecha": la app no tiene horas.
          `${gasto.fecha}T12:00:00.000Z`,
          tz,
          gasto.fecha,
          ts,
          ts,
        ],
      },
    );
    return leer();
  }

  function quitarGasto(id: string): EstadoGastos {
    const ts = ahora();
    db.exec('UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE id IN (?, ?)', {
      bind: [ts, ts, `tx-${id}`, id],
    });
    return leer();
  }

  function crearCategoria(label: string): EstadoGastos {
    // El reducer valida longitud y duplicados (id/etiqueta).
    const siguiente = agregarCategoria(leer(), label);
    const nueva = siguiente.categorias[siguiente.categorias.length - 1];
    const ts = ahora();
    db.exec(
      `INSERT INTO categories (id, ledger_id, parent_id, name, type, budget_class, cost_type,
              icon, color, sort_order, is_archived, created_at, updated_at, deleted_at)
        SELECT ?, ?, NULL, ?, 'expense', NULL, NULL, NULL, NULL,
              COALESCE(MAX(sort_order), -1) + 1, 0, ?, ?, NULL
          FROM categories WHERE ledger_id = ?`,
      { bind: [nueva.id, IDS.ledger, nueva.label, ts, ts, IDS.ledger] },
    );
    return leer();
  }

  function definirPresupuesto(categoriaId: string, monto: number): EstadoGastos {
    // El reducer valida; 0 = quitar el presupuesto.
    const siguiente = actualizarPresupuesto(leer(), categoriaId, monto);
    const montoLimpio = siguiente.presupuestos[categoriaId];
    const ts = ahora();
    if (montoLimpio === undefined) {
      // Borrado duro: budgets es UNIQUE(ledger_id, category_id) y un borrado
      // lógico dejaría la fila fantasma bloqueando recrear el presupuesto.
      db.exec('DELETE FROM budgets WHERE ledger_id = ? AND category_id = ?', {
        bind: [IDS.ledger, categoriaId],
      });
    } else {
      // ON CONFLICT sin objetivo (SQLite ≥ 3.35): cubre id y
      // UNIQUE(ledger_id, category_id) por igual. Motor real: 3.54.1.
      db.exec(
        `INSERT INTO budgets (id, ledger_id, category_id, amount_minor, alert_pct_1, alert_pct_2,
                rollover, created_at, updated_at, deleted_at)
          VALUES (?, ?, ?, ?, 80, 100, 0, ?, ?, NULL)
          ON CONFLICT DO UPDATE SET amount_minor = excluded.amount_minor, updated_at = excluded.updated_at`,
        { bind: [`budget-${categoriaId}`, IDS.ledger, categoriaId, aUnidadesMinimas(montoLimpio, moneda), ts, ts] },
      );
    }
    return leer();
  }

  return { leer, guardarGasto, quitarGasto, crearCategoria, definirPresupuesto };
}

/**
 * Respaldo para entornos sin kvvfs (jsdom/tests y build node): mismas
 * operaciones, validación y semántica, persistiendo en el localStorage legado
 * (STORAGE_KEY de `lib/gastos/modelo.ts`). Si ese respaldo escribe, la base SQL
 * no existe en ese entorno (ErrorSinKvvfs lo garantiza), así que no conviven dos
 * verdades; en un navegador real con kvvfs disponible, la primera apertura
 * migra lo acumulado en localStorage.
 */
export function crearRepositorioLocal(): RepositorioGastos {
  const leer = (): EstadoGastos =>
    leerEstado() ?? { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
  const guardar = (siguiente: EstadoGastos): EstadoGastos => {
    escribirEstado(siguiente);
    return siguiente;
  };
  return {
    leer,
    guardarGasto: (input) => guardar(agregarGasto(leer(), input)),
    quitarGasto: (id) => guardar(eliminarGasto(leer(), id)),
    crearCategoria: (label) => guardar(agregarCategoria(leer(), label)),
    definirPresupuesto: (categoriaId, monto) =>
      guardar(actualizarPresupuesto(leer(), categoriaId, monto)),
  };
}
