import type { MetricResult } from './types';
import { round2 } from './money';

export function mesesDeCobertura(liquidBalance: number, gastosEsenciales: number): MetricResult<'meses_cobertura'> {
  const inputs = {
    liquidBalance: round2(liquidBalance),
    gastosEsenciales: round2(gastosEsenciales),
  };
  let value: number | null;
  if (gastosEsenciales > 0) {
    value = round2(liquidBalance / gastosEsenciales);
  } else {
    value = liquidBalance > 0 ? null : 0;
  }
  return {
    key: 'meses_cobertura',
    label: 'Meses de cobertura',
    value,
    unit: 'meses',
    formula: 'Saldo líquido ÷ gastos esenciales',
    inputs,
  };
}