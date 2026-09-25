import { describe, it, expect } from 'vitest';
import { MISIONES, MISSION_STATUS_LABELS, type MissionStatus } from '../index';

describe('misiones del MVP', () => {
  it('son exactamente las 5 del seed (migración 0002)', () => {
    expect(MISIONES.map((m) => m.slug)).toEqual([
      'mi-foto-financiera',
      'mi-deuda-en-claro',
      'mis-tres-numeros',
      'escenario-emergencia',
      'escenario-gastos',
    ]);
  });

  it('sort_order es 1..5 sin duplicados', () => {
    const orders = MISIONES.map((m) => m.sortOrder).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5]);
  });

  it('cada misión tiene cómoCompletarla y al menos una acción requerida', () => {
    for (const m of MISIONES) {
      expect(m.requiredActions.length).toBeGreaterThanOrEqual(1);
      expect(m.howToComplete.length).toBeGreaterThan(20);
      expect(m.title.length).toBeGreaterThan(3);
    }
  });

  it('tiene etiquetas para los 3 estados y claves únicas', () => {
    for (const status of Object.keys(MISSION_STATUS_LABELS) as MissionStatus[]) {
      expect(MISSION_STATUS_LABELS[status].length).toBeGreaterThan(2);
    }
    expect(new Set(MISIONES.map((m) => m.slug)).size).toBe(MISIONES.length);
  });
});