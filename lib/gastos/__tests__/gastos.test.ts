// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ESTADO_VACIO,
  agregarCategoria,
  agregarGasto,
  actualizarPresupuesto,
  aCSV,
  eliminarGasto,
  estadoPresupuesto,
  filtrarGastos,
  mesActual,
  mesDe,
  slugify,
  totalGastos,
  totalesPorCategoria,
  type EstadoGastos,
} from "../modelo";

let estado: EstadoGastos;

beforeEach(() => {
  window.localStorage.clear();
  estado = { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] };
});

afterEach(() => {
  window.localStorage.clear();
});

const gasto = (over: Partial<Parameters<typeof agregarGasto>[1]> = {}) => ({
  fecha: '2026-09-10',
  monto: 15000,
  categoriaId: 'alimentacion',
  ...over,
});

describe("categorías", () => {
  it("slugify quita acentos y espacios", () => {
    expect(slugify('Comida Rápida')).toBe('comida-rapida');
    expect(slugify('  Otros!!  ')).toBe('otros');
  });

  it("agregarCategoria agrega y normaliza", () => {
    const e = agregarCategoria(estado, 'Comida Rápida');
    expect(e.categorias.map((c) => c.id)).toContain('comida-rapida');
    expect(e.categorias.some((c) => c.label === 'Comida Rápida')).toBe(true);
  });

  it("rechaza duplicadas, vacías y demasiado cortas", () => {
    expect(() => agregarCategoria(estado, 'alimentacion')).toThrow(/ya existe/);
    expect(() => agregarCategoria(estado, '   ')).toThrow(/2 caracteres/);
  });
});

describe("gastos", () => {
  it("agrega con nota opcional y redondea a 2 decimales", () => {
    const e = agregarGasto(estado, gasto({ monto: 1234.567, nota: '  pan y café  ' }));
    expect(e.gastos).toHaveLength(1);
    expect(e.gastos[0].monto).toBe(1234.57);
    expect(e.gastos[0].nota).toBe('pan y café');
    expect(e.gastos[0].id).toBeTruthy();
  });

  it("rechaza monto inválido, fecha inválida y categoría desconocida", () => {
    expect(() => agregarGasto(estado, gasto({ monto: 0 }))).toThrow(/mayor a 0/);
    expect(() => agregarGasto(estado, gasto({ fecha: '10-09-2026' }))).toThrow(/Fecha inválida/);
    expect(() => agregarGasto(estado, gasto({ categoriaId: 'nope' }))).toThrow(/desconocida/);
  });

  it("eliminarGasto quita solo ese gasto", () => {
    let e = agregarGasto(estado, gasto());
    const id = e.gastos[0].id;
    e = agregarGasto(e, gasto({ monto: 2000 }));
    e = eliminarGasto(e, id);
    expect(e.gastos).toHaveLength(1);
    expect(e.gastos[0].id).not.toBe(id);
  });
});

describe("filtros y totales", () => {
  beforeEach(() => {
    estado = agregarGasto(estado, gasto({ fecha: '2026-09-10', monto: 15000, nota: 'pan' }));
    estado = agregarGasto(estado, gasto({ fecha: '2026-09-20', monto: 8000, categoriaId: 'transporte', nota: 'metro' }));
    estado = agregarGasto(estado, gasto({ fecha: '2026-10-05', monto: 3000, categoriaId: 'ocio' }));
  });

  it("filtra por mes, categoría y texto", () => {
    expect(filtrarGastos(estado.gastos, { mes: '2026-09', categoriaId: '', texto: '' })).toHaveLength(2);
    expect(filtrarGastos(estado.gastos, { mes: '', categoriaId: 'transporte', texto: '' })).toHaveLength(1);
    expect(filtrarGastos(estado.gastos, { mes: '', categoriaId: '', texto: 'pan' })).toHaveLength(1);
  });

  it("total y totales por categoría", () => {
    expect(totalGastos(estado.gastos)).toBe(26000);
    expect(totalesPorCategoria(estado.gastos)).toEqual({ alimentacion: 15000, transporte: 8000, ocio: 3000 });
  });

  it("mesDe y mesActual", () => {
    expect(mesDe('2026-09-10')).toBe('2026-09');
    expect(mesActual()).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe("presupuesto", () => {
  it("estado según umbral", () => {
    expect(estadoPresupuesto(50, 100)).toBe('ok');
    expect(estadoPresupuesto(80, 100)).toBe('cerca');
    expect(estadoPresupuesto(100, 100)).toBe('excedido');
    expect(estadoPresupuesto(100, undefined)).toBeNull();
  });

  it("actualizarPresupuesto guarda y elimina al poner 0", () => {
    let e = actualizarPresupuesto(estado, 'alimentacion', 100000);
    expect(e.presupuestos.alimentacion).toBe(100000);
    e = actualizarPresupuesto(e, 'alimentacion', 0);
    expect(e.presupuestos.alimentacion).toBeUndefined();
    expect(() => actualizarPresupuesto(estado, 'alimentacion', -5)).toThrow(/inválido/);
  });
});

describe("exportación", () => {
  it("CSV con encabezado y campos escapados", () => {
    const e = agregarGasto(estado, gasto({ monto: 15000, nota: 'pan "duro"' }));
    const csv = aCSV(e, e.gastos);
    expect(csv.split('\n')[0]).toBe('fecha;categoria;monto;nota');
    expect(csv).toContain('2026-09-10;Alimentación;15000;');
    expect(csv).toContain('"pan ""duro"""');
  });
});
