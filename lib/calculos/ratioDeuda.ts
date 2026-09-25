import type { MetricResult } from './types';
import { round2 } from './money';

export function ratioDeuda(pagosMensualesDeuda: number, ingresoMensual: number): MetricResult<'ratio_deuda'> {
  const inputs = {
    pagosMensualesDeuda: round2(pagosMensualesDeuda),
    ingresoMensual: round2(ingresoMensual),
  };
  const value = ingresoMensual > 0 ? round2(pagosMensualesDeuda / ingresoMensual) : null;
  return {
    key: 'ratio_deuda',
    label: 'Ratio de deuda',
    value,
    unit: 'ratio',
    formula: 'Pagos mensuales de deuda ÷ ingreso mensual',
    inputs,
  };
}