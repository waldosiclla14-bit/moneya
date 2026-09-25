import type { Database } from '../supabase/db-types';

export type AgeBucket = Database['public']['Enums']['age_bucket'];

export type ItemBlock = 'describe' | 'frequency';

export interface CFPBItem {
  key: string;
  number: number;
  item: string;
  block: ItemBlock;
  reverse: boolean;
}

export interface ResponseOption {
  value: number;
  label: string;
}

export const AGE_BUCKET_LABELS: Record<AgeBucket, string> = {
  '18_61': '18–61',
  '62_plus': '62 o más',
};

const describe = {
  bloque: 'describe',
  opciones: [
    { value: 4, label: 'Totalmente' },
    { value: 3, label: 'Muy bien' },
    { value: 2, label: 'En cierta medida' },
    { value: 1, label: 'Muy poco' },
    { value: 0, label: 'No me describe en lo absoluto' },
  ] as const,
};

const frecuencia = {
  bloque: 'frequency',
  opciones: [
    { value: 4, label: 'Siempre' },
    { value: 3, label: 'A menudo' },
    { value: 2, label: 'A veces' },
    { value: 1, label: 'Casi nunca' },
    { value: 0, label: 'Nunca' },
  ] as const,
};

export function optionsDe(bloque: ItemBlock): readonly ResponseOption[] {
  return bloque === 'describe' ? describe.opciones : frecuencia.opciones;
}

export function blockLabel(bloque: ItemBlock): string {
  return bloque === 'describe'
    ? '¿Qué tan bien lo describe a usted o su situación lo siguiente?'
    : '¿Con qué frecuencia le ocurre lo siguiente?';
}

export const CFPB_ITEMS: readonly CFPBItem[] = [
  { key: 'fwb1_expense', number: 1, item: 'Podría hacer frente a un gasto imprevisto importante', block: 'describe', reverse: false },
  { key: 'fwb3_secure', number: 2, item: 'Estoy asegurando mi futuro financiero', block: 'describe', reverse: false },
  { key: 'fwb5_never', number: 3, item: 'Debido a mi situación financiera, creo que nunca tendré las cosas que quiero en la vida', block: 'describe', reverse: true },
  { key: 'fwb6_enjoy', number: 4, item: 'Puedo disfrutar la vida debido a la manera en que manejo mi dinero', block: 'describe', reverse: false },
  { key: 'fwb2_getby', number: 5, item: 'Apenas estoy subsistiendo financieramente', block: 'describe', reverse: true },
  { key: 'fwb4_concern', number: 6, item: 'Me preocupa que el dinero que tengo o que ahorre no me dure', block: 'describe', reverse: true },
  { key: 'fwb9_strain', number: 7, item: 'Hacer un regalo para una boda, un cumpleaños u otra ocasión supondría una enorme carga para mis finanzas del mes', block: 'frequency', reverse: true },
  { key: 'fwb10_left', number: 8, item: 'Me sobra dinero al final del mes', block: 'frequency', reverse: false },
  { key: 'fwb7_behind', number: 9, item: 'Estoy atrasado en mis finanzas', block: 'frequency', reverse: true },
  { key: 'fwb8_control', number: 10, item: 'Mis finanzas controlan mi vida', block: 'frequency', reverse: true },
];

export const ITEM_BY_KEY: ReadonlyMap<string, CFPBItem> = new Map(CFPB_ITEMS.map((i) => [i.key, i]));