import type { IncomeBreakdown } from './types';

export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function clampPct(pct: number): number {
  if (!Number.isFinite(pct)) return 0;
  return Math.min(1, Math.max(0, pct));
}

export function sum(parts: number[]): number {
  return parts.reduce((acc, p) => acc + (Number.isFinite(p) ? p : 0), 0);
}

export function ingresoTotal(income: IncomeBreakdown): number {
  return round2(income.dependiente + income.independiente + income.otros);
}

export function gastosTotales(esencial: number, noEsencial: number): number {
  return round2(esencial + noEsencial);
}