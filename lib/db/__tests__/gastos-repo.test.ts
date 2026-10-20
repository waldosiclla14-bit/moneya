import { describe, expect, it } from 'vitest';
import {
  ESTADO_VACIO,
  actualizarPresupuesto,
  agregarGasto,
  type EstadoGastos,
} from '../../gastos/modelo';
import {
  IDS,
  planificarMigracionGastos,
  type ContextoMigracion,
} from '../migracion';
import { abrirRepositorioGastos, crearRepositorio, tzDelDispositivo } from '../gastos-repo';
import { abrirMotor, aplicarEsquemaSiVacia, ejecutarPlan } from '../motor';

/**
 * Repositorio de gastos (lib/db/gastos-repo.ts) sobre el motor sqlite-wasm real:
 * migración → hidratación → CRUD → re-hidratación, con las reglas de decimales
 * por moneda (CLP 0 · PEN 2). En Node no existe kvvfs: la prueba de
 * `abrirRepositorioGastos` verifica el respaldo local (ErrorSinKvvfs).
 */

const CTX_CL: ContextoMigracion = { pais: 'CL', tz: '-03:00', ahora: '2026-10-20T12:00:00.000Z' };
const CTX_PE: ContextoMigracion = { pais: 'PE', tz: '-05:00', ahora: '2026-10-20T12:00:00.000Z' };

/** 2 gastos CLP (1500 · 400) y 1 presupuesto (1000), igual que motor.test. */
function estadoDePrueba(): EstadoGastos {
  let estado: EstadoGastos = { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
  estado = agregarGasto(estado, { fecha: '2026-10-03', monto: 1500, categoriaId: 'alimentacion', nota: 'Feria' });
  estado = agregarGasto(estado, { fecha: '2026-10-05', monto: 400, categoriaId: 'transporte' });
  estado = actualizarPresupuesto(estado, 'alimentacion', 1000);
  return estado;
}

async function repoMigrado(estado: EstadoGastos, ctx: ContextoMigracion) {
  const sqlite3 = await abrirMotor();
  const db = new sqlite3.oo1.DB(':memory:', 'c');
  expect(aplicarEsquemaSiVacia(db)).toBe(true);
  ejecutarPlan(db, planificarMigracionGastos(estado, ctx));
  return { db, repo: crearRepositorio(db) };
}

describe('repositorio de gastos (lib/db/gastos-repo.ts)', () => {
  it('en entorno sin kvvfs (Node) abre el respaldo local con el estado base', async () => {
    const repo = await abrirRepositorioGastos(CTX_CL);
    expect(repo.leer()).toEqual({
      ...ESTADO_VACIO,
      categorias: [...ESTADO_VACIO.categorias],
    });
  });

  it('hidrata exactamente el estado migrado (round-trip de localStorage a SQL)', async () => {
    const estado = estadoDePrueba();
    const { db, repo } = await repoMigrado(estado, CTX_CL);

    expect(repo.leer()).toEqual(estado);
    db.close();
  });

  it('PEN conserva 2 decimales: escribe céntimos enteros y lee unidades', async () => {
    const { db, repo } = await repoMigrado({ ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] }, CTX_PE);

    const gasto = repo.guardarGasto({ fecha: '2026-10-07', monto: 12.5, categoriaId: 'ocio', nota: 'Cine' });
    expect(gasto.gastos[0].monto).toBe(12.5);
    expect(Number(db.selectValue('SELECT amount_minor FROM transactions ORDER BY rowid DESC LIMIT 1'))).toBe(1250);

    const conPresupuesto = repo.definirPresupuesto('alimentacion', 50.75);
    expect(conPresupuesto.presupuestos.alimentacion).toBe(50.75);
    expect(Number(db.selectValue('SELECT amount_minor FROM budgets'))).toBe(5075);
    db.close();
  });

  it('CLP redondea a pesos enteros; montos que redondean a 0 se rechazan sin escribir', async () => {
    const { db, repo } = await repoMigrado({ ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] }, CTX_CL);

    const gasto = repo.guardarGasto({ fecha: '2026-10-07', monto: 12.4, categoriaId: 'transporte' });
    expect(gasto.gastos[0].monto).toBe(12);
    expect(Number(db.selectValue('SELECT amount_minor FROM transactions ORDER BY rowid DESC LIMIT 1'))).toBe(12);

    expect(() => repo.guardarGasto({ fecha: '2026-10-07', monto: 0.4, categoriaId: 'transporte' })).toThrow(
      /redondea a 0/,
    );
    expect(Number(db.selectValue('SELECT COUNT(*) FROM transactions'))).toBe(1);
    db.close();
  });

  it('categoría desconocida: el reducer lanza y no escribe nada', async () => {
    const { db, repo } = await repoMigrado({ ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] }, CTX_CL);

    expect(() =>
      repo.guardarGasto({ fecha: '2026-10-07', monto: 900, categoriaId: 'no-existe' }),
    ).toThrow(/Categoría desconocida/);
    expect(Number(db.selectValue('SELECT COUNT(*) FROM transactions'))).toBe(0);
    db.close();
  });

  it('quitar gasto es borrado lógico (la fila queda con deleted_at y sale de la vista)', async () => {
    const { db, repo } = await repoMigrado({ ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] }, CTX_CL);
    const guardado = repo.guardarGasto({ fecha: '2026-10-08', monto: 2500, categoriaId: 'salud' });

    repo.quitarGasto(guardado.gastos[0].id);

    expect(repo.leer().gastos).toHaveLength(0);
    expect(db.selectValue('SELECT deleted_at FROM transactions WHERE id = ?', [`tx-${guardado.gastos[0].id}`])).toBeTruthy();
    expect(Number(db.selectValue('SELECT COUNT(*) FROM v_tx_effective'))).toBe(0);
    db.close();
  });

  it('crear categoria la coloca al final (sort_order) y rechaza duplicados', async () => {
    const { db, repo } = await repoMigrado({ ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] }, CTX_CL);

    const conNueva = repo.crearCategoria('Mascotas');
    expect(conNueva.categorias[conNueva.categorias.length - 1]).toEqual({ id: 'mascotas', label: 'Mascotas' });
    expect(
      Number(db.selectValue('SELECT sort_order FROM categories WHERE id = ?', ['mascotas'])),
    ).toBe(conNueva.categorias.length - 1);

    expect(() => repo.crearCategoria('mascotas')).toThrow(/ya existe/);
    expect(() => repo.crearCategoria('X')).toThrow(/al menos 2 caracteres/);
    db.close();
  });

  it('presupuesto: crea, actualiza sin filas duplicadas y elimina con 0 (y permite recrear)', async () => {
    const { db, repo } = await repoMigrado(estadoDePrueba(), CTX_CL);
    expect(repo.leer().presupuestos.alimentacion).toBe(1000);

    const actualizado = repo.definirPresupuesto('alimentacion', 7000);
    expect(actualizado.presupuestos.alimentacion).toBe(7000);
    expect(Number(db.selectValue('SELECT COUNT(*) FROM budgets'))).toBe(1);
    expect(Number(db.selectValue('SELECT amount_minor FROM budgets'))).toBe(7000);

    const quitado = repo.definirPresupuesto('alimentacion', 0);
    expect(quitado.presupuestos.alimentacion).toBeUndefined();
    expect(Number(db.selectValue('SELECT COUNT(*) FROM budgets'))).toBe(0);

    const recreado = repo.definirPresupuesto('alimentacion', 2500);
    expect(recreado.presupuestos.alimentacion).toBe(2500);
    expect(Number(db.selectValue('SELECT COUNT(*) FROM budgets'))).toBe(1);
    db.close();
  });

  it('la hidratación es equivalente a la vista v_tx_effective (mismo conteo y misma suma)', async () => {
    const { db, repo } = await repoMigrado({ ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] }, CTX_CL);
    repo.guardarGasto({ fecha: '2026-10-01', monto: 3000, categoriaId: 'vivienda', nota: 'Luz' });
    repo.guardarGasto({ fecha: '2026-10-02', monto: 1200, categoriaId: 'transporte', nota: 'Metro' });
    repo.quitarGasto(repo.leer().gastos[1].id);

    const directa = db.selectObjects(
      `SELECT id, amount_minor FROM transactions
        WHERE ledger_id = ? AND type = 'expense' AND status = 'confirmed' AND deleted_at IS NULL
        ORDER BY occurred_on DESC, rowid DESC`,
      [IDS.ledger],
    );
    const vista = db.selectObjects(
      'SELECT id, amount_minor FROM v_tx_effective ORDER BY occurred_on DESC, created_at DESC',
    );
    expect(directa.map((f) => [String(f.id), Number(f.amount_minor)])).toEqual(
      vista.map((f) => [String(f.id), Number(f.amount_minor)]),
    );
    expect(repo.leer().gastos).toHaveLength(directa.length);
    db.close();
  });

  it('tzDelDispositivo produce un offset ±HH:MM válido', () => {
    expect(tzDelDispositivo()).toMatch(/^[+-]\d{2}:\d{2}$/);
  });
});
