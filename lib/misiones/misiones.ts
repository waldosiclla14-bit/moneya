import type { Database } from '../supabase/db-types';

export type MissionStatus = Database['public']['Enums']['mission_status'];

export interface Mision {
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  requiredActions: string[];
  howToComplete: string;
}

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  no_iniciada: 'No iniciada',
  en_curso: 'En curso',
  completada: 'Completada',
};

export const MISIONES: readonly Mision[] = [
  {
    slug: 'mi-foto-financiera',
    title: 'Mi foto financiera',
    description: 'Guarda tu primer snapshot del mes: ingresos, gastos y lo que tienes líquido.',
    sortOrder: 1,
    requiredActions: ['financial_inputs.created'],
    howToComplete: 'Ve a Finanzas y completa tu mes: ingresos por fuente, gastos y saldo líquido.',
  },
  {
    slug: 'mi-deuda-en-claro',
    title: 'Mi deuda en claro',
    description: 'Registra al menos una deuda para saber qué parte de tu ingreso se va en cuotas.',
    sortOrder: 2,
    requiredActions: ['liabilities.created'],
    howToComplete: 'Agrega al menos una deuda en Finanzas (nombre, saldo y cuota mensual).',
  },
  {
    slug: 'mis-tres-numeros',
    title: 'Mis tres números',
    description: 'Revisa tus tres métricas: meses de cobertura, ratio de deuda y concentración de ingreso.',
    sortOrder: 3,
    requiredActions: ['metrics.viewed'],
    howToComplete: 'Revisa tus tres números en tu foto financiera.',
  },
  {
    slug: 'escenario-emergencia',
    title: '¿Y si perdiera mi ingreso?',
    description: 'Simula un escenario de pérdida de ingreso y mira cuánto aguantas.',
    sortOrder: 4,
    requiredActions: ['simulation.complete_lost_work'],
    howToComplete: 'En Simular, elige el escenario «Pérdida de ingreso» y ejecútalo.',
  },
  {
    slug: 'escenario-gastos',
    title: '¿Y si mis gastos suben?',
    description: 'Crea una segunda simulación (gastos +X% o ingresos -X%) y compara.',
    sortOrder: 5,
    requiredActions: ['simulation.complete_second'],
    howToComplete: 'Crea un segundo escenario (gastos +X% o ingresos -X%) en Simular y compáralo.',
  },
];

export const MISION_POR_SLUG: ReadonlyMap<string, Mision> = new Map(MISIONES.map((m) => [m.slug, m]));