import type { LiabilityKind } from './types';
import { round2 } from './money';

export interface DeudaInput {
  id: string;
  nombre: string;
  tipo: LiabilityKind;
  saldo: number;
  cuotaMensual: number;
  tasaAnual: number;
}

export const DEUDA_TIPO_LABELS: Record<LiabilityKind, string> = {
  tarjeta: 'Tarjeta de crédito',
  prestamo: 'Préstamo',
  hipoteca: 'Hipoteca',
  vehiculo: 'Vehículo',
  otro: 'Otra',
};

export function sumaCuotas(deudas: DeudaInput[]): number {
  return round2(deudas.reduce((acc, d) => acc + d.cuotaMensual, 0));
}

export function sumaSaldos(deudas: DeudaInput[]): number {
  return round2(deudas.reduce((acc, d) => acc + d.saldo, 0));
}

export function cuotasDesdeDeudas(deudas: DeudaInput[]): number {
  return sumaCuotas(deudas);
}