import { describe, it, expect } from 'vitest';
import { mesesDeCobertura } from '../mesesCobertura';

describe('mesesDeCobertura', () => {
  it('calcula cobertura = liquidez ÷ gastos esenciales', () => {
    const r = mesesDeCobertura(600000, 200000);
    expect(r.value).toBe(3);
    expect(r.unit).toBe('meses');
    expect(r.formula).toContain('÷');
  });

  it('redondea a 2 decimales', () => {
    expect(mesesDeCobertura(100000, 3).value).toBe(33333.33);
  });

  it('con gastos esenciales nulos y liquidez positiva devuelve null (indefinido)', () => {
    const r = mesesDeCobertura(500000, 0);
    expect(r.value).toBeNull();
  });

  it('con todo en cero devuelve 0', () => {
    expect(mesesDeCobertura(0, 0).value).toBe(0);
  });
});