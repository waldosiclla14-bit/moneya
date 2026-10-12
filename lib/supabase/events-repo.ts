import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './db-types';

export type EventName = Database['public']['Enums']['event_name'];

const EMPTY_PROPERTIES: Json = {};

const MAX_PROPIEDADES = 10;
const MAX_LARGO_TEXTO = 64;

const CLAVES_PROHIBIDAS = [
  'monto',
  'ingreso',
  'ingresos',
  'gasto',
  'gastos',
  'deuda',
  'deudas',
  'saldo',
  'cuota',
  'tasa',
  'interes',
  'interés',
  'sueldo',
  'renta',
  'ahorro',
  'email',
  'correo',
  'telefono',
  'teléfono',
  'dni',
  'rut',
  'tarjeta',
  'password',
  'clave',
];

export function validarPropiedades(properties: Json): Json {
  if (properties === null || typeof properties !== 'object' || Array.isArray(properties)) {
    throw new Error('properties debe ser un objeto plano de valores primitivos.');
  }

  const entradas = Object.entries(properties);
  if (entradas.length > MAX_PROPIEDADES) {
    throw new Error(`properties supera el máximo de ${MAX_PROPIEDADES} claves.`);
  }

  const limpio: Record<string, string | number | boolean> = {};
  for (const [clave, valor] of entradas) {
    const normalizada = clave.toLowerCase();
    if (CLAVES_PROHIBIDAS.some((prohibida) => normalizada.includes(prohibida))) {
      throw new Error(
        `La clave "${clave}" no está permitida en properties (dato sensible o financiero).`,
      );
    }
    if (valor === null || !['string', 'number', 'boolean'].includes(typeof valor)) {
      throw new Error(`El valor de "${clave}" debe ser texto, número o booleano.`);
    }
    if (typeof valor === 'string' && valor.length > MAX_LARGO_TEXTO) {
      throw new Error(`El valor de "${clave}" supera ${MAX_LARGO_TEXTO} caracteres.`);
    }
    if (typeof valor === 'number' && !Number.isFinite(valor)) {
      throw new Error(`El valor de "${clave}" debe ser un número finito.`);
    }
    limpio[clave] = valor as string | number | boolean;
  }

  return limpio;
}

export async function registrarEvento(
  client: SupabaseClient<Database>,
  userId: string,
  eventName: EventName,
  properties: Json = EMPTY_PROPERTIES,
): Promise<void> {
  const propiedadesSeguras = validarPropiedades(properties);

  const { error } = await client
    .from('events')
    .insert({ user_id: userId, event_name: eventName, properties: propiedadesSeguras });

  if (error) throw new Error(`No se pudo registrar el evento ${eventName}: ${error.message}`);
}