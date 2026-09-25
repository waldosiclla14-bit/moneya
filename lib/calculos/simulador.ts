import type { FinancialSnapshot } from './types';
import { round2 } from './money';
import { analizarSnapshot, type MargenFinanciero } from './margenFinanciero';

export type Escenario =
  | { type: 'ingresos_menos'; pct: number }
  | { type: 'gastos_mas'; pct: number }
  | { type: 'perdida_ingreso'; pct?: number }
  | { type: 'emergencia'; monto: number }
  | { type: 'personalizado'; incomePct?: number; expensePct?: number; extraExpense?: number };

export interface SimulationProyeccion {
  escenario: string;
  base: MargenFinanciero;
  proyectado: MargenFinanciero;
  deltas: {
    mesesCobertura: number | null;
    ratioDeuda: number | null;
    ratioAhorro: number | null;
  };
  pasoAccionable: string | null;
}

const HORIZONTE_MESES = 12;

function clampChange(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(3, Math.max(-1, v));
}

function delta(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  return round2(b - a);
}

function project(snapshot: FinancialSnapshot, escenario: Escenario): FinancialSnapshot {
  const { income, expenses, liquidBalance, debtMonthlyPayments } = snapshot;

  switch (escenario.type) {
    case 'ingresos_menos': {
      const k = 1 - Math.min(1, Math.max(0, escenario.pct));
      return {
        ...snapshot,
        income: {
          dependiente: round2(income.dependiente * k),
          independiente: round2(income.independiente * k),
          otros: round2(income.otros * k),
        },
      };
    }
    case 'gastos_mas': {
      const k = 1 + Math.min(1, Math.max(0, escenario.pct));
      return {
        ...snapshot,
        expenses: {
          esencial: round2(expenses.esencial * k),
          noEsencial: round2(expenses.noEsencial * k),
        },
      };
    }
    case 'perdida_ingreso': {
      const k = 1 - Math.min(1, Math.max(0, escenario.pct ?? 1));
      return {
        ...snapshot,
        income: {
          dependiente: round2(income.dependiente * k),
          independiente: round2(income.independiente * k),
          otros: round2(income.otros * k),
        },
      };
    }
    case 'emergencia': {
      const drained = Math.max(0, liquidBalance - Math.max(0, escenario.monto));
      return { ...snapshot, liquidBalance: round2(drained) };
    }
    case 'personalizado': {
      const kIncome = 1 + clampChange(escenario.incomePct ?? 0);
      const kExpense = 1 + clampChange(escenario.expensePct ?? 0);
      const drained = Math.max(0, liquidBalance - Math.max(0, escenario.extraExpense ?? 0));
      return {
        ...snapshot,
        income: {
          dependiente: round2(income.dependiente * kIncome),
          independiente: round2(income.independiente * kIncome),
          otros: round2(income.otros * kIncome),
        },
        expenses: {
          esencial: round2(expenses.esencial * kExpense),
          noEsencial: round2(expenses.noEsencial * kExpense),
        },
        liquidBalance: round2(drained),
      };
    }
  }
}

function descripcionEscenario(escenario: Escenario): string {
  switch (escenario.type) {
    case 'ingresos_menos':
      return `Ingresos ${Math.round(escenario.pct * 100)}% menores`;
    case 'gastos_mas':
      return `Gastos ${Math.round(escenario.pct * 100)}% mayores`;
    case 'perdida_ingreso': {
      const pct = escenario.pct ?? 1;
      return pct >= 1 ? 'Pérdida total de ingresos' : `Pérdida del ${Math.round(pct * 100)}% de ingresos`;
    }
    case 'emergencia':
      return `Gasto imprevisto de ${round2(escenario.monto)}`;
    case 'personalizado': {
      const partes: string[] = [];
      const i = escenario.incomePct ?? 0;
      const e = escenario.expensePct ?? 0;
      const x = escenario.extraExpense ?? 0;
      if (i !== 0) partes.push(`ingresos ${i > 0 ? '+' : ''}${Math.round(i * 100)}%`);
      if (e !== 0) partes.push(`gastos ${e > 0 ? '+' : ''}${Math.round(e * 100)}%`);
      if (x > 0) partes.push(`gasto extra de ${round2(x)}`);
      return partes.length > 0 ? `Escenario personalizado (${partes.join(', ')})` : 'Escenario personalizado (sin cambios)';
    }
  }
}

function pasoAccionable(base: MargenFinanciero, proyectado: MargenFinanciero): string | null {
  const baseMeses = base.mesesCobertura.value;
  const proyMeses = proyectado.mesesCobertura.value;

  // Caso 1: la cobertura cae.
  if (baseMeses !== null && proyMeses !== null) {
    const perdida = baseMeses - proyMeses;
    if (perdida > 0) {
      const necesaria = Math.ceil((perdida * base.gastosEsenciales) / HORIZONTE_MESES);
      if (base.gastosNoEsenciales > 0) {
        const factible = Math.min(necesaria, Math.round(base.gastosNoEsenciales));
        return (
          `Bajo este escenario, tus meses de cobertura pasarían de ${baseMeses} a ${proyMeses}. ` +
          `Destinar ${factible}/mes de tus gastos no esenciales durante ${HORIZONTE_MESES} meses compensa la caída.`
        );
      }
    }
  }

  // Caso 2: el flujo mensual se vuelve negativo aunque la cobertura no cambie.
  if (proyectado.ahorroMensual < 0 && base.gastosNoEsenciales > 0) {
    const necesaria = Math.ceil(Math.abs(proyectado.ahorroMensual));
    const factible = Math.min(necesaria, Math.round(base.gastosNoEsenciales));
    return (
      `Bajo este escenario, tu flujo mensual sería negativo en ${necesaria}/mes. ` +
      `Reducir ${factible}/mes de gastos no esenciales lo equilibraría.`
    );
  }

  return null;
}

export function simularEscenario(snapshot: FinancialSnapshot, escenario: Escenario): SimulationProyeccion {
  const proyectadoSnapshot = project(snapshot, escenario);
  const base = analizarSnapshot(snapshot);
  const proyectado = analizarSnapshot(proyectadoSnapshot);

  return {
    escenario: descripcionEscenario(escenario),
    base,
    proyectado,
    deltas: {
      mesesCobertura: delta(base.mesesCobertura.value, proyectado.mesesCobertura.value),
      ratioDeuda: delta(base.ratioDeuda.value, proyectado.ratioDeuda.value),
      ratioAhorro: delta(base.ratioAhorro, proyectado.ratioAhorro),
    },
    pasoAccionable: pasoAccionable(base, proyectado),
  };
}