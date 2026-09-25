import type { AgeBucket, CFPBItem } from './items';
import { CFPB_ITEMS, ITEM_BY_KEY } from './items';

export interface RespuestaItem {
  key: string;
  response: number;
}

export interface DimensionBreakdown {
  key: 'dimension_control' | 'dimension_shock' | 'dimension_goals' | 'dimension_freedom';
  label: string;
  value: number;
  formula: string;
  inputs: Record<string, number>;
  items: string[];
}

export interface ResultadoWellbeing {
  totalResponseValue: number;
  score: number;
  dimensions: DimensionBreakdown[];
  note: string;
}

const SELF_ADMINISTERED_18_61 = [
  14, 19, 22, 25, 27, 29, 31, 32, 34, 35, 37, 38, 40, 41, 42, 44, 45, 46, 47, 49, 50, 51, 52, 54, 55, 56, 58, 59, 60, 62, 63,
  65, 66, 68, 69, 71, 73, 75, 78, 81, 86,
];

const SELF_ADMINISTERED_62_PLUS = [
  14, 20, 24, 26, 29, 31, 33, 35, 36, 38, 39, 41, 42, 44, 45, 46, 48, 49, 50, 52, 53, 54, 56, 57, 58, 60, 61, 63, 64, 66, 67,
  69, 71, 73, 75, 77, 79, 82, 84, 88, 95,
];

const DIMENSION_DEFS = [
  { key: 'dimension_control', label: 'Control', items: ['fwb2_getby', 'fwb10_left'] },
  { key: 'dimension_shock', label: 'Imprevistos', items: ['fwb1_expense', 'fwb7_behind', 'fwb9_strain'] },
  { key: 'dimension_goals', label: 'Futuro y metas', items: ['fwb3_secure', 'fwb4_concern', 'fwb5_never'] },
  { key: 'dimension_freedom', label: 'Libertad y disfrute', items: ['fwb6_enjoy', 'fwb8_control'] },
] as const;

export const NOTE_RESULTADO =
  'Puntaje CFPB Financial Well-Being (escala validada, dominio público). El desglose por ejes es descriptivo, derivado de los ítems codificados; no constituye un score psicométrico por eje.';

export function respuestasCompletas(respuestas: RespuestaItem[]): boolean {
  if (respuestas.length !== CFPB_ITEMS.length) return false;
  const keys = new Set(respuestas.map((r) => r.key));
  return keys.size === CFPB_ITEMS.length;
}

export function validarRespuestas(respuestas: RespuestaItem[]): string | null {
  if (!respuestasCompletas(respuestas)) return 'La escala requiere responder los 10 ítems.';
  if (respuestas.some((r) => !ITEM_BY_KEY.has(r.key))) return 'Respuesta con ítem desconocido.';
  if (respuestas.some((r) => !Number.isInteger(r.response) || r.response < 0 || r.response > 4))
    return 'Cada respuesta debe ser un valor entero entre 0 y 4.';
  return null;
}

export function codificarItem(item: CFPBItem, response: number): number {
  const codigo = Number.isInteger(response) && response >= 0 && response <= 4 ? response : 0;
  return item.reverse ? 4 - codigo : codigo;
}

export function totalDeRespuestas(respuestas: RespuestaItem[]): number {
  const error = validarRespuestas(respuestas);
  if (error) throw new Error(error);
  const porKey = new Map(respuestas.map((r) => [r.key, r.response]));
  return CFPB_ITEMS.reduce((sum, item) => sum + codificarItem(item, porKey.get(item.key) as number), 0);
}

export function scoreCFPB(totalResponseValue: number, ageBucket: AgeBucket): number {
  if (!Number.isInteger(totalResponseValue) || totalResponseValue < 0 || totalResponseValue > 40) {
    throw new Error(`Valor total de respuestas inválido: ${totalResponseValue}. Debe ser un entero entre 0 y 40.`);
  }
  const tabla = ageBucket === '62_plus' ? SELF_ADMINISTERED_62_PLUS : SELF_ADMINISTERED_18_61;
  return tabla[totalResponseValue];
}

export function desgloseDimensiones(respuestas: RespuestaItem[]): DimensionBreakdown[] {
  const error = validarRespuestas(respuestas);
  if (error) throw new Error(error);
  const porKey = new Map(respuestas.map((r) => [r.key, r.response]));

  return DIMENSION_DEFS.map((def) => {
    const codificados = def.items.map((key) => codificarItem(ITEM_BY_KEY.get(key) as CFPBItem, porKey.get(key) as number));
    const promedio = codificados.reduce((a, b) => a + b, 0) / codificados.length;
    return {
      key: def.key,
      label: def.label,
      value: Math.round((promedio / 4) * 100),
      formula: 'Promedio de ítems codificados CFPB (0–4) ÷ 4 × 100',
      inputs: { promedio: Math.round(promedio * 100) / 100 },
      items: [...def.items],
    };
  });
}

export function calcularWellbeing(respuestas: RespuestaItem[], ageBucket: AgeBucket): ResultadoWellbeing {
  const totalResponseValue = totalDeRespuestas(respuestas);
  return {
    totalResponseValue,
    score: scoreCFPB(totalResponseValue, ageBucket),
    dimensions: desgloseDimensiones(respuestas),
    note: NOTE_RESULTADO,
  };
}