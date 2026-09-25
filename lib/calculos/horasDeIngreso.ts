import { round2 } from './money';

export const HORAS_LABORABLES_MES_DEFAULT = 160;

export function ingresoPorHora(ingresoMensual: number, horasLaborablesMes = HORAS_LABORABLES_MES_DEFAULT): number {
  if (!Number.isFinite(ingresoMensual) || !Number.isFinite(horasLaborablesMes) || ingresoMensual <= 0 || horasLaborablesMes <= 0) {
    return 0;
  }
  return round2(ingresoMensual / horasLaborablesMes);
}

export function horasDeIngreso(monto: number, ingresoMensual: number, horasLaborablesMes = HORAS_LABORABLES_MES_DEFAULT): number {
  if (!Number.isFinite(monto) || monto <= 0) return 0;
  const ph = ingresoPorHora(ingresoMensual, horasLaborablesMes);
  if (ph <= 0) return 0;
  return round2(monto / ph);
}

export interface EquivalenciaHoras {
  horas: number;
  ingresoPorHora: number;
  formula: string;
  inputs: { monto: number; ingresoMensual: number; horasLaborablesMes: number };
}

export function equivalenciaHoras(monto: number, ingresoMensual: number, horasLaborablesMes = HORAS_LABORABLES_MES_DEFAULT): EquivalenciaHoras {
  return {
    horas: horasDeIngreso(monto, ingresoMensual, horasLaborablesMes),
    ingresoPorHora: ingresoPorHora(ingresoMensual, horasLaborablesMes),
    formula: 'Horas = monto ÷ (ingreso mensual ÷ horas laborables del mes)',
    inputs: { monto, ingresoMensual, horasLaborablesMes },
  };
}