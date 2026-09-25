import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import type { Mision } from '../misiones';

type MissionRow = Database['public']['Tables']['missions']['Row'];

export function decodificarMision(row: MissionRow): Mision {
  const requiredActions = Array.isArray(row.required_actions)
    ? (row.required_actions as unknown as string[])
    : [];
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    requiredActions,
    howToComplete: '',
  };
}

export async function listarMisiones(client: SupabaseClient<Database>): Promise<Mision[]> {
  const { data, error } = await client
    .from('missions')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`No se pudieron listar las misiones: ${error.message}`);
  return data.map(decodificarMision);
}