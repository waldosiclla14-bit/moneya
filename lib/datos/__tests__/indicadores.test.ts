import { describe, it, expect } from 'vitest';
import { INDICADOR_DEFS, PAISES, VALORES, FUENTE } from '../index';

describe('datos LATAM (Global Findex 2025)', () => {
  it('4 indicadores y 2 países → 8 filas', () => {
    expect(INDICADOR_DEFS).toHaveLength(4);
    expect(PAISES).toHaveLength(2);
    expect(VALORES).toHaveLength(8);
  });

  it('toda fila combina un país válido con un indicador definido', () => {
    const codes = new Set(PAISES.map((p) => p.code));
    const keys = new Set(INDICADOR_DEFS.map((d) => d.key));
    for (const v of VALORES) {
      expect(codes.has(v.countryCode)).toBe(true);
      expect(keys.has(v.key)).toBe(true);
      expect(v.value === null || (v.value >= 0 && v.value <= 100)).toBe(true);
    }
  });

  it('regla PRD: la única cifra publicada es Chile cuenta 85,1 (2024); el resto en verificación', () => {
    const conValor = VALORES.filter((v) => v.value !== null);
    expect(conValor).toHaveLength(1);
    expect(conValor[0]).toMatchObject({ countryCode: 'CL', key: 'account_ownership', value: 85.1, year: 2024 });
  });

  it('los 4 indicadores tienen etiqueta, definición y código Findex', () => {
    for (const d of INDICADOR_DEFS) {
      expect(d.label.length).toBeGreaterThan(3);
      expect(d.definition.length).toBeGreaterThan(20);
      expect(d.fndCode.length).toBeGreaterThan(3);
    }
  });

  it('la ficha de fuente está completa', () => {
    expect(FUENTE.institution).toBe('Banco Mundial (World Bank)');
    expect(FUENTE.url).toMatch(/^https:\/\//);
    expect(FUENTE.methodology.length).toBeGreaterThan(50);
  });
});