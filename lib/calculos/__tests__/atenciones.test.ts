import { describe, it, expect } from 'vitest';
import { analizarAtenciones, COBERTURA_ATENCION_MESES } from '../atenciones';
import type { MargenFinanciero } from '../margenFinanciero';

function margen(overrides: Partial<MargenFinanciero>): MargenFinanciero {
  const base: MargenFinanciero = {
    ingresoMensual: 1500000,
    gastosMensuales: 1000000,
    gastosEsenciales: 600000,
    gastosNoEsenciales: 400000,
    ahorroMensual: 500000,
    ratioAhorro: 0.33,
    liquidBalance: 0,
    mesesCobertura: {
      key: 'meses_cobertura' as const,
      label: 'Meses de cobertura',
      value: 0,
      unit: 'meses' as const,
      formula: 'Saldo líquido ÷ gastos esenciales',
      inputs: { liquidBalance: 0, gastosEsenciales: 600000 },
    },
    ratioDeuda: {
      key: 'ratio_deuda' as const,
      label: 'Ratio de deuda',
      value: 0,
      unit: 'ratio' as const,
      formula: 'Pagos mensuales de deuda ÷ ingreso mensual',
      inputs: { pagosMensualesDeuda: 0, ingresoMensual: 1500000 },
    },
    concentracionIngreso: {
      key: 'concentracion_ingreso' as const,
      label: 'Concentración de ingreso',
      value: 1,
      unit: 'porcentaje' as const,
      formula: 'Fuente de ingreso principal ÷ ingreso total',
      inputs: { ingresoDependiente: 1500000, ingresoIndependiente: 0, ingresoOtros: 0 },
    },
  };
  return { ...base, ...overrides };
}

describe('analizarAtenciones', () => {
  it('señala atención cuando el colchón cubre menos de 3 meses', () => {
    const p = analizarAtenciones(margen({ mesesCobertura: { ...margen({}).mesesCobertura, value: 1.2 } }));
    expect(p.hayAtencion).toBe(true);
    const c = p.atenciones.find((a) => a.clave === 'cobertura');
    expect(c?.nivel).toBe('atencion');
    expect(c?.titulo).toBe('Colchón corto');
  });

  it('respeta el umbral exacto de 3 meses (sin atención)', () => {
    const p = analizarAtenciones(
      margen({ mesesCobertura: { ...margen({}).mesesCobertura, value: COBERTURA_ATENCION_MESES } }),
    );
    const c = p.atenciones.find((a) => a.clave === 'cobertura');
    expect(c?.nivel).toBe('ok');
  });

  it('marca colchón base alcanzado entre 3 y 6 meses', () => {
    const p = analizarAtenciones(
      margen({ mesesCobertura: { ...margen({}).mesesCobertura, value: 4 } }),
    );
    const c = p.atenciones.find((a) => a.clave === 'cobertura');
    expect(c?.nivel).toBe('ok');
    expect(c?.titulo).toContain('base');
  });

  it('marca deuda alta a partir de 40%', () => {
    const p = analizarAtenciones(margen({ ratioDeuda: { ...margen({}).ratioDeuda, value: 0.4 } }));
    const d = p.atenciones.find((a) => a.clave === 'deuda');
    expect(d?.nivel).toBe('atencion');

    const p2 = analizarAtenciones(margen({ ratioDeuda: { ...margen({}).ratioDeuda, value: 0.39 } }));
    const d2 = p2.atenciones.find((a) => a.clave === 'deuda');
    expect(d2?.nivel).toBe('ok');
  });

  it('marca concentración alta a partir de 60%', () => {
    const p = analizarAtenciones(margen({ concentracionIngreso: { ...margen({}).concentracionIngreso, value: 0.6 } }));
    const c = p.atenciones.find((a) => a.clave === 'concentracion');
    expect(c?.nivel).toBe('atencion');

    const p2 = analizarAtenciones(margen({ concentracionIngreso: { ...margen({}).concentracionIngreso, value: 0.59 } }));
    const c2 = p2.atenciones.find((a) => a.clave === 'concentracion');
    expect(c2?.nivel).toBe('ok');
  });

  it('prioriza cobertura al sugerir el paso', () => {
    const p = analizarAtenciones(
      margen({
        mesesCobertura: { ...margen({}).mesesCobertura, value: 1 },
        ratioDeuda: { ...margen({}).ratioDeuda, value: 0.5 },
        concentracionIngreso: { ...margen({}).concentracionIngreso, value: 0.9 },
      }),
    );
    expect(p.hayAtencion).toBe(true);
    expect(p.paso).toContain('meta de colchón');
    expect(p.paso).toContain('$1.800.000');
  });

  it('sugiere paso de deuda cuando es la única atención', () => {
    const p = analizarAtenciones(
      margen({
        mesesCobertura: { ...margen({}).mesesCobertura, value: 12 },
        ratioDeuda: { ...margen({}).ratioDeuda, value: 0.6 },
        concentracionIngreso: { ...margen({}).concentracionIngreso, value: 0.5 },
      }),
    );
    expect(p.paso).toContain('mayor tasa anual');
  });

  it('no sugiere acción cuando no hay atenciones', () => {
    const p = analizarAtenciones(
      margen({
        mesesCobertura: { ...margen({}).mesesCobertura, value: 8 },
        ratioDeuda: { ...margen({}).ratioDeuda, value: 0.2 },
        concentracionIngreso: { ...margen({}).concentracionIngreso, value: 0.5 },
      }),
    );
    expect(p.hayAtencion).toBe(false);
    expect(p.paso).toContain('registra tus gastos');
  });

  it('ignore valores nulos sin romper el análisis', () => {
    const p = analizarAtenciones(
      margen({
        mesesCobertura: { ...margen({}).mesesCobertura, value: null },
        ratioDeuda: { ...margen({}).ratioDeuda, value: null },
        concentracionIngreso: { ...margen({}).concentracionIngreso, value: null },
      }),
    );
    expect(p.hayAtencion).toBe(false);
    expect(p.atenciones).toHaveLength(0);
  });
});