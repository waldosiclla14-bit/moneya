import { describe, it, expect } from 'vitest';
import type { FinancialSnapshot } from '../types';
import { analizarSnapshot, resumirMetricas } from '../margenFinanciero';
import { simularEscenario } from '../simulador';

const base = (overrides: Partial<FinancialSnapshot> = {}): FinancialSnapshot => ({
  income: { dependiente: 1000000, independiente: 0, otros: 0 },
  expenses: { esencial: 400000, noEsencial: 300000 },
  liquidBalance: 1200000,
  debtMonthlyPayments: 0,
  ...overrides,
});

describe('analizarSnapshot', () => {
  it('entrega los 3 componentes por separado, sin score compuesto', () => {
    const m = analizarSnapshot(base());
    expect(m.mesesCobertura.value).toBe(3); // 1.2M / 400k
    expect(m.ratioDeuda.value).toBe(0);
    expect(m.concentracionIngreso.value).toBe(1); // 100% dependiente
    expect(m.ahorroMensual).toBe(300000);
    expect(m.ratioAhorro).toBe(0.3);
  });

  it('resumirMetricas solo incluye métricas calculables', () => {
    const m = analizarSnapshot(base({ expenses: { esencial: 0, noEsencial: 0 }, liquidBalance: 500000 }));
    const keys = resumirMetricas(m).map((x) => x.key);
    expect(keys).not.toContain('meses_cobertura');
  });
});

describe('simularEscenario', () => {
  it('ingresos -50% deja el flujo negativo y ofrece paso accionable', () => {
    const r = simularEscenario(base(), { type: 'ingresos_menos', pct: 0.5 });
    expect(r.escenario).toBe('Ingresos 50% menores');
    expect(r.proyectado.ingresoMensual).toBe(500000);
    // Ingreso 500000 < gastos 700000 → ahorro mensual negativo (-200000).
    expect(r.proyectado.ahorroMensual).toBe(-200000);
    // La cobertura depende de liquidez y gastos esenciales: no cambia.
    expect(r.deltas.mesesCobertura).toBe(0);
    expect(r.pasoAccionable).toContain('Bajo este escenario');
    expect(r.pasoAccionable).toContain('flujo mensual');
  });

  it('emergencia drena solo el saldo líquido', () => {
    const r = simularEscenario(base(), { type: 'emergencia', monto: 2000000 });
    expect(r.proyectado.liquidBalance).toBe(0);
    expect(r.proyectado.ingresoMensual).toBe(1000000);
  });

  it('pérdida total de ingresos deja ingreso en 0; la cobertura no cambia (depende de liquidez, no de ingreso)', () => {
    const r = simularEscenario(base(), { type: 'perdida_ingreso' });
    expect(r.proyectado.ingresoMensual).toBe(0);
    expect(r.proyectado.mesesCobertura.value).toBe(3); // sigue liquidez/(gastos esenciales): el drenaje no ocurrió
  });

  it('escenario sin empeoramiento no ofrece paso accionable', () => {
    const r = simularEscenario(base(), { type: 'ingresos_menos', pct: 0 });
    expect(r.pasoAccionable).toBeNull();
  });

  it('es determinista: mismos inputs, mismos resultados', () => {
    const a = simularEscenario(base(), { type: 'gastos_mas', pct: 0.2 });
    const b = simularEscenario(base(), { type: 'gastos_mas', pct: 0.2 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('gastos +20% sube gastos totales proporcionalmente', () => {
    const r = simularEscenario(base(), { type: 'gastos_mas', pct: 0.2 });
    expect(r.proyectado.gastosMensuales).toBe(840000);
  });
});