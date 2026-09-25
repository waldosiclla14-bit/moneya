import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';

const TABLAS_DATOS = [
  'profiles',
  'financial_inputs',
  'liabilities',
  'wellbeing_answers',
  'wellbeing_results',
  'simulations',
  'mission_progress',
  'events',
] as const;

type TablaDatos = (typeof TABLAS_DATOS)[number];

function builder(client: SupabaseClient<Database>, tabla: TablaDatos): any {
  return client.from(tabla);
}

export async function exportarDatosUsuario(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Record<string, unknown[]>> {
  const resultado: Record<string, unknown[]> = {};

  for (const tabla of TABLAS_DATOS) {
    const column = tabla === 'profiles' ? 'id' : 'user_id';
    const query = builder(client, tabla).select('*').order(column, { ascending: true });
    const { data, error } = tabla === 'profiles'
      ? await query.eq('id', userId)
      : await query.eq('user_id', userId);

    if (error) throw new Error(`No se pudieron exportar ${tabla}: ${error.message}`);
    resultado[tabla] = data as unknown[];
  }

  return resultado;
}

export async function eliminarDatosUsuario(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  for (const tabla of TABLAS_DATOS) {
    const query = builder(client, tabla).delete();
    const { error } = tabla === 'profiles'
      ? await query.eq('id', userId)
      : await query.eq('user_id', userId);

    if (error && tabla !== 'events') {
      throw new Error(`No se pudieron borrar ${tabla}: ${error.message}`);
    }
  }
}