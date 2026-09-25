import type { IncomeBreakdown, MetricResult } from './types';
import { round2 } from './money';

export function concentracionIngreso(income: IncomeBreakdown): MetricResult<'concentracion_ingreso'> {
  const inputs = {
    ingresoDependiente: round2(income.dependiente),
    ingresoIndependiente: round2(income.independiente),
    ingresoOtros: round2(income.otros),
  };
  const total = income.dependiente + income.independiente + income.otros;
  const principal = Math.max(income.dependiente, income.independiente, income.otros);
  const value = total > 0 ? round2(principal / total) : null;
  return {
    key: 'concentracion_ingreso',
    label: 'Concentración de ingreso',
    value,
    unit: 'porcentaje',
    formula: 'Fuente de ingreso principal ÷ ingreso total',
    inputs,
  };
}