import type { FinancialSnapshot, MetricResult } from './types';
import { round2, ingresoTotal, gastosTotales } from './money';
import { mesesDeCobertura } from './mesesCobertura';
import { ratioDeuda } from './ratioDeuda';
import { concentracionIngreso } from './concentracionIngreso';

export interface MargenFinanciero {
  ingresoMensual: number;
  gastosMensuales: number;
  gastosEsenciales: number;
  gastosNoEsenciales: number;
  ahorroMensual: number;
  ratioAhorro: number | null;
  liquidBalance: number;
  mesesCobertura: MetricResult<'meses_cobertura'>;
  ratioDeuda: MetricResult<'ratio_deuda'>;
  concentracionIngreso: MetricResult<'concentracion_ingreso'>;
}

export function analizarSnapshot(snapshot: FinancialSnapshot): MargenFinanciero {
  const ingresoMensual = ingresoTotal(snapshot.income);
  const gastosEsenciales = round2(snapshot.expenses.esencial);
  const gastosNoEsenciales = round2(snapshot.expenses.noEsencial);
  const gastosMensuales = gastosTotales(gastosEsenciales, gastosNoEsenciales);
  const ahorroMensual = round2(ingresoMensual - gastosMensuales);
  const ratioAhorro = ingresoMensual > 0 ? round2(ahorroMensual / ingresoMensual) : null;

  return {
    ingresoMensual,
    gastosMensuales,
    gastosEsenciales,
    gastosNoEsenciales,
    ahorroMensual,
    ratioAhorro,
    liquidBalance: round2(snapshot.liquidBalance),
    // Componentes separados, sin índice compuesto (PRD sección 9).
    mesesCobertura: mesesDeCobertura(snapshot.liquidBalance, gastosEsenciales),
    ratioDeuda: ratioDeuda(snapshot.debtMonthlyPayments, ingresoMensual),
    concentracionIngreso: concentracionIngreso(snapshot.income),
  };
}

export function resumirMetricas(margen: MargenFinanciero): MetricResult[] {
  return [margen.mesesCobertura, margen.ratioDeuda, margen.concentracionIngreso].filter(
    (m) => m.value !== null,
  );
}