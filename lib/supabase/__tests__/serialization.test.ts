import { describe, it, expect } from 'vitest';
import type { FinancialSnapshot, Escenario } from '../../calculos';
import { simularEscenario } from '../../calculos';
import type { Database } from '../db-types';

const snapshot: FinancialSnapshot = {
  income: { dependiente: 1000000, independiente: 200000, otros: 0 },
  expenses: { esencial: 400000, noEsencial: 300000 },
  liquidBalance: 1200000,
  debtMonthlyPayments: 150000,
};

const escenarios: Escenario[] = [
  { type: 'ingresos_menos', pct: 0.3 },
  { type: 'gastos_mas', pct: 0.2 },
  { type: 'perdida_ingreso', pct: 0.5 },
  { type: 'emergencia', monto: 800000 },
  { type: 'personalizado', incomePct: -0.2, expensePct: 0.1, extraExpense: 100000 },
];

describe('serialización simulations (params/result JSONB)', () => {
  it('el resultado de simularEscenario es JSON puro (sin funciones/clases)', () => {
    for (const escenario of escenarios) {
      const result = simularEscenario(snapshot, escenario);
      const ronda = JSON.parse(JSON.stringify(result));
      expect(ronda).toEqual(result);
    }
  });

  it('params { snapshot, escenario } son JSON-serializables y estables', () => {
    for (const escenario of escenarios) {
      const params = { snapshot, escenario };
      const ronda = JSON.parse(JSON.stringify(params));
      expect(ronda).toEqual(params);
    }
  });

  it('todo escenario mapea a un scenario_type de la base', () => {
    const tipos: Database['public']['Enums']['scenario_type'][] = [
      'ingresos_menos',
      'gastos_mas',
      'perdida_ingreso',
      'emergencia',
      'personalizado',
    ];
    for (const escenario of escenarios) {
      expect(tipos).toContain(escenario.type);
    }
  });

  it('decodificar conserva params y result idénticos tras el viaje por JSON', () => {
    for (const escenario of escenarios) {
      const result = simularEscenario(snapshot, escenario);
      const json = JSON.stringify({ params: { snapshot, escenario }, result });
      const parsed = JSON.parse(json) as { params: { snapshot: FinancialSnapshot; escenario: Escenario }; result: unknown };
      expect(parsed.params.snapshot).toEqual(snapshot);
      expect(parsed.params.escenario).toEqual(escenario);
      expect(parsed.result).toEqual(result);
    }
  });
});