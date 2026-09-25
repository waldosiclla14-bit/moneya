import { describe, it, expect } from 'vitest';
import { horasDeIngreso, ingresoPorHora, equivalenciaHoras } from '../horasDeIngreso';

describe('horasDeIngreso (marco Your Money or Your Life — Robin/Dominguez)', () => {
  it('calcula horas equivalentes a un ingreso mensual dado', () => {
    // Ingreso por hora = 1.200.000 / 160 = 7.500; 300.000 / 7.500 = 40 h
    expect(ingresoPorHora(1_200_000)).toBe(7500);
    expect(horasDeIngreso(300_000, 1_200_000)).toBe(40);
  });

  it('respeta horas laborables custom', () => {
    // 1.200.000 / 80 = 15.000 por hora; 300.000 / 15.000 = 20 h
    expect(horasDeIngreso(300_000, 1_200_000, 80)).toBe(20);
  });

  it('devuelve 0 si faltan inputs válidos (monto no positivo o ingreso nulo)', () => {
    expect(horasDeIngreso(0, 1_200_000)).toBe(0);
    expect(horasDeIngreso(-100, 1_200_000)).toBe(0);
    expect(horasDeIngreso(300_000, 0)).toBe(0);
    expect(horasDeIngreso(300_000, -1)).toBe(0);
    expect(horasDeIngreso(300_000, 1_200_000, 0)).toBe(0);
  });

  it('no redondea en exceso: mantiene 2 decimales', () => {
    const small = horasDeIngreso(10_000, 1_200_000);
    expect(small).toBe(1.33); // 10000 / 7500
  });

  it('equivalenciaHoras expone fórmula e inputs (transparencia de V1)', () => {
    const eq = equivalenciaHoras(300_000, 1_200_000);
    expect(eq.horas).toBe(40);
    expect(eq.ingresoPorHora).toBe(7500);
    expect(eq.formula).toContain('÷');
    expect(eq.inputs).toEqual({ monto: 300_000, ingresoMensual: 1_200_000, horasLaborablesMes: 160 });
  });
});