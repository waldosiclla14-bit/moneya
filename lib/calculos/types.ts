export type IncomeBreakdown = {
  dependiente: number;
  independiente: number;
  otros: number;
};

export type ExpenseBreakdown = {
  esencial: number;
  noEsencial: number;
};

export type FinancialSnapshot = {
  income: IncomeBreakdown;
  expenses: ExpenseBreakdown;
  liquidBalance: number;
  debtMonthlyPayments: number;
};

export type MetricUnit = 'meses' | 'ratio' | 'porcentaje' | 'moneda';

export type MetricKey = 'meses_cobertura' | 'ratio_deuda' | 'concentracion_ingreso' | 'ratio_ahorro';

export type LiabilityKind = 'tarjeta' | 'prestamo' | 'hipoteca' | 'vehiculo' | 'otro';

export interface MetricResult<K extends MetricKey = MetricKey> {
  key: K;
  label: string;
  value: number | null;
  unit: MetricUnit;
  formula: string;
  inputs: Record<string, number>;
}