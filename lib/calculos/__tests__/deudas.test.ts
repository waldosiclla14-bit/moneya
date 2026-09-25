import { describe, it, expect } from 'vitest';
import { sumaCuotas, sumaSaldos, cuotasDesdeDeudas } from '../deudas';
import type { DeudaInput } from '../deudas';

function deuda(overrides: Partial<DeudaInput> = {}): DeudaInput {
  return {
    id: 'd1',
    nombre: 'Tarjeta',
    tipo: 'tarjeta',
    saldo: 500000,
    cuotaMensual: 50000,
    tasaAnual: 24,
    ...overrides,
  };
}

describe('deudas', () => {
  it('suma cuotas mensuales de todas las deudas', () => {
    expect(sumaCuotas([deuda(), deuda({ id: 'd2', cuotaMensual: 100000 })])).toBe(150000);
  });

  it('cuotasDesdeDeudas es el valor que alimenta el ratio de deuda', () => {
    expect(cuotasDesdeDeudas([deuda()])).toBe(50000);
  });

  it('redondea a 2 decimales', () => {
    expect(sumaCuotas([deuda({ cuotaMensual: 0.005 }), deuda({ cuotaMensual: 0.005 })])).toBe(0.01);
  });

  it('suma saldos totales', () => {
    expect(sumaSaldos([deuda(), deuda({ id: 'd2', saldo: 300000 })])).toBe(800000);
  });

  it('deuda sin cuota no altera la suma', () => {
    expect(sumaCuotas([deuda({ cuotaMensual: 0 })])).toBe(0);
  });
});