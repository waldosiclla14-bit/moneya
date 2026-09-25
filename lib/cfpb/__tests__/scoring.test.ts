import { describe, it, expect } from 'vitest';
import { CFPB_ITEMS, totalDeRespuestas, scoreCFPB, codificarItem, desgloseDimensiones, calcularWellbeing } from '../index';

function respuestasDe(codificados: number[]): { key: string; response: number }[] {
  return CFPB_ITEMS.map((item, i) => ({
    key: item.key,
    response: item.reverse ? 4 - codificados[i] : codificados[i],
  }));
}

const ANCLA = respuestasDe([1, 1, 1, 1, 1, 1, 1, 1, 2, 2]); // TRV 12 (ejemplo oficial: → 40 en 18–61 self)

describe('codificarItem', () => {
  it('no invierte ítems directos y sí invierte los reverse (4 − respuesta)', () => {
    const directo = CFPB_ITEMS.find((i) => !i.reverse) as (typeof CFPB_ITEMS)[number];
    const reverso = CFPB_ITEMS.find((i) => i.reverse) as (typeof CFPB_ITEMS)[number];
    expect(codificarItem(directo, 4)).toBe(4);
    expect(codificarItem(directo, 0)).toBe(0);
    expect(codificarItem(reverso, 4)).toBe(0);
    expect(codificarItem(reverso, 0)).toBe(4);
  });

  it('la escala tiene 10 ítems con las claves oficiales del reporte técnico', () => {
    expect(CFPB_ITEMS.map((i) => i.key)).toEqual([
      'fwb1_expense',
      'fwb3_secure',
      'fwb5_never',
      'fwb6_enjoy',
      'fwb2_getby',
      'fwb4_concern',
      'fwb9_strain',
      'fwb10_left',
      'fwb7_behind',
      'fwb8_control',
    ]);
  });
});

describe('totalDeRespuestas', () => {
  it('suma los valores codificados (no los crudos)', () => {
    expect(totalDeRespuestas(ANCLA)).toBe(12);
  });

  it('rechaza respuestas incompletas', () => {
    expect(() => totalDeRespuestas(ANCLA.slice(0, 9))).toThrow(/10 ítems/);
  });

  it('rechaza respuestas duplicadas o desconocidas', () => {
    const duplicada = [...ANCLA.slice(0, 9), { key: 'fwb1_expense', response: 2 }];
    expect(() => totalDeRespuestas(duplicada)).toThrow(/10 ítems/);
    const desconocida = [...ANCLA.slice(0, 9), { key: 'otro_item', response: 2 }];
    expect(() => totalDeRespuestas(desconocida)).toThrow(/ítem desconocido/);
  });

  it('rechaza valores fuera de 0–4', () => {
    const invalida = [...ANCLA.slice(0, 9), { key: 'fwb8_control', response: 7 }];
    expect(() => totalDeRespuestas(invalida)).toThrow(/entre 0 y 4/);
  });
});

describe('scoreCFPB (hoja oficial, autoadministrado)', () => {
  it('valida el ancla de la guía: TRV 12 → 40 en 18–61', () => {
    expect(calcularWellbeing(ANCLA, '18_61').score).toBe(40);
  });

  it('TRV 12 → 42 en 62+ y TRV 36 → 79 en 62+', () => {
    expect(scoreCFPB(12, '62_plus')).toBe(42);
    expect(scoreCFPB(36, '62_plus')).toBe(79);
  });

  it('límites: TRV 0 → 14 y TRV 40 → 86 (18–61) / 95 (62+)', () => {
    expect(scoreCFPB(0, '18_61')).toBe(14);
    expect(scoreCFPB(0, '62_plus')).toBe(14);
    expect(scoreCFPB(40, '18_61')).toBe(86);
    expect(scoreCFPB(40, '62_plus')).toBe(95);
  });

  it('es monótona creciente y siempre está en 14–95 para cualquier TRV', () => {
    for (const bucket of ['18_61', '62_plus'] as const) {
      let prev = -1;
      for (let t = 0; t <= 40; t++) {
        const s = scoreCFPB(t, bucket);
        expect(s).toBeGreaterThan(prev);
        expect(s).toBeGreaterThanOrEqual(14);
        expect(s).toBeLessThanOrEqual(95);
        prev = s;
      }
    }
  });

  it('rechaza TRV fuera de rango', () => {
    expect(() => scoreCFPB(41, '18_61')).toThrow();
    expect(() => scoreCFPB(-1, '18_61')).toThrow();
  });
});

describe('desgloseDimensiones', () => {
  it('usa cada uno de los 10 ítems exactamente una vez en 4 ejes', () => {
    const dims = desgloseDimensiones(ANCLA);
    expect(dims).toHaveLength(4);
    const todas = dims.flatMap((d) => d.items);
    expect(todas).toHaveLength(10);
    expect(new Set(todas).size).toBe(10);
  });

  it('es determinista y acotado 0–100', () => {
    const a = calcularWellbeing(ANCLA, '18_61');
    const b = calcularWellbeing(ANCLA, '18_61');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    for (const d of a.dimensions) {
      expect(d.value).toBeGreaterThanOrEqual(0);
      expect(d.value).toBeLessThanOrEqual(100);
    }
  });

  it('refleja los codificados del ancla (promedio ÷ 4 × 100)', () => {
    const dims = desgloseDimensiones(ANCLA);
    const por = (key: string) => dims.find((d) => d.key === key)?.value;
    expect(por('dimension_control')).toBe(25); // fwb2=1, fwb10=1
    expect(por('dimension_shock')).toBe(33); // fwb1=1, fwb7=2, fwb9=1 → 1.333
    expect(por('dimension_goals')).toBe(25); // fwb3, fwb4, fwb5 = 1
    expect(por('dimension_freedom')).toBe(38); // fwb6=1, fwb8=2 → 1.5
  });
});

describe('calcularWellbeing', () => {
  it('ya completo (todos 4 codificados) → score 86 en 18–61', () => {
    const max = respuestasDe(Array(10).fill(4));
    const r = calcularWellbeing(max, '18_61');
    expect(r.totalResponseValue).toBe(40);
    expect(r.score).toBe(86);
    expect(r.dimensions.every((d) => d.value === 100)).toBe(true);
  });

  it('ancla completa con nota de transparencia', () => {
    const r = calcularWellbeing(ANCLA, '62_plus');
    expect(r.note).toContain('descriptivo');
  });
});