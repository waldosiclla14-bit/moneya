import { describe, it, expect } from 'vitest';
import {
  PAIS_DEFAULT,
  crearFormateadorMoneda,
  crearFormateadorNumero,
  localeDePais,
  monedaDePais,
  paisDe,
} from '../moneda';

describe('formato por país', () => {
  it('defecto es Chile', () => {
    expect(PAIS_DEFAULT).toBe('CL');
    expect(localeDePais()).toBe('es-CL');
    expect(monedaDePais()).toBe('CLP');
  });

  it('resuelve locale y moneda de Perú', () => {
    expect(localeDePais('PE')).toBe('es-PE');
    expect(monedaDePais('PE')).toBe('PEN');
  });

  it('cae a Chile ante un código desconocido', () => {
    expect(paisDe('XX').code).toBe('CL');
    expect(localeDePais('XX')).toBe('es-CL');
    expect(localeDePais(null)).toBe('es-CL');
  });

  it('formatea montos según los separadores de cada país', () => {
    expect(crearFormateadorMoneda('CL').format(1234567)).toBe('1.234.567');
    expect(crearFormateadorMoneda('PE').format(1234567)).toBe('1,234,567');
  });

  it('respeta las opciones del formateador de números', () => {
    expect(crearFormateadorNumero('CL', { maximumFractionDigits: 1 }).format(1.5)).toBe('1,5');
    expect(crearFormateadorNumero('PE', { maximumFractionDigits: 1 }).format(1.5)).toBe('1.5');
  });
});
