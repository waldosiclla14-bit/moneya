import type { DeudaInput } from '../calculos';

// Semilla de demo: deja la app lista para probar el flujo completo
// (panel de hoy → finanzas → misiones) sin tipear datos. Todo queda en
// localStorage de este navegador; no toca Supabase ni inventa evidencia:
// son los mismos valores de ejemplo de FotoFinanciera.

const FOTO_KEY = 'moneya:foto:mes:v1';
const MISIONES_KEY = 'moneya.mission_progress.v1';
const ONBOARDED_KEY = 'moneya.onboarded.v1';

export const DEMO_DEUDA: DeudaInput = {
  id: 'demo-tarjeta',
  nombre: 'Tarjeta',
  tipo: 'tarjeta',
  saldo: 600000,
  cuotaMensual: 150000,
  tasaAnual: 0,
};

export const DEMO_FOTO = {
  form: {
    mes: '2026-09',
    dependiente: '1000000',
    independiente: '200000',
    otros: '0',
    esencial: '400000',
    noEsencial: '250000',
    liquidez: '1200000',
  },
  deudas: [DEMO_DEUDA],
  gastoPuntual: '300000',
  horasLabMes: '160',
};

export const DEMO_MISIONES: Record<string, 'no_iniciada' | 'en_curso' | 'completada'> = {
  'mi-foto-financiera': 'completada',
  'mi-deuda-en-claro': 'completada',
  'mis-tres-numeros': 'en_curso',
  'escenario-emergencia': 'no_iniciada',
  'escenario-gastos': 'no_iniciada',
};

export function cargarDemo(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FOTO_KEY, JSON.stringify(DEMO_FOTO));
    window.localStorage.setItem(MISIONES_KEY, JSON.stringify(DEMO_MISIONES));
    window.localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    /* sin almacenamiento: la demo no persiste */
  }
}

export function limpiarDemo(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(FOTO_KEY);
    window.localStorage.removeItem(MISIONES_KEY);
    window.localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    /* sin almacenamiento: nada que limpiar */
  }
}
