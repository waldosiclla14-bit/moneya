import { describe, it, expect } from 'vitest';
import { ratioDeuda } from '../ratioDeuda';
import { concentracionIngreso } from '../concentracionIngreso';

describe('ratioDeuda', () => {
  it('calcula pagos mensuales ÷ ingreso mensual', () => {
    const r = ratioDeuda(150000, 1000000);
    expect(r.value).toBe(0.15);
  });

  it('sin ingreso devuelve null (no calculable)', () => {
    expect(ratioDeuda(100000, 0).value).toBeNull();
  });
});

describe('concentracionIngreso', () => {
  it('una fuente dominante concentra en su proporción', () => {
    const r = concentracionIngreso({ dependiente: 800000, independiente: 200000, otros: 0 });
    expect(r.value).toBe(0.8);
  });

  it('sin ingreso devuelve null', () => {
    expect(concentracionIngreso({ dependiente: 0, independiente: 0, otros: 0 }).value).toBeNull();
  });

  it('dos fuentes iguales concentran 0.5', () => {
    expect(concentracionIngreso({ dependiente: 500000, independiente: 500000, otros: 0 }).value).toBe(0.5);
  });
});