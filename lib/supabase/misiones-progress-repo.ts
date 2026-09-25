import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import type { MissionStatus } from '../misiones';

export interface ProgresoMision {
  missionSlug: string;
  status: MissionStatus;
}

export interface MissionIdBySlug {
  id: string;
  slug: string;
}

export async function resetearProgresoMisiones(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await client.from('mission_progress').delete().eq('user_id', userId);
  if (error) throw new Error(`No se pudo reiniciar el progreso de misiones: ${error.message}`);
}

export async function listarMisionesConId(client: SupabaseClient<Database>): Promise<MissionIdBySlug[]> {
  const { data, error } = await client.from('missions').select('id, slug').order('sort_order', { ascending: true });

  if (error) throw new Error(`No se pudieron listar las misiones: ${error.message}`);
  return data.map((row) => ({ id: row.id, slug: row.slug }));
}

export async function listarProgresoMisiones(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<ProgresoMision[]> {
  const misiones = await listarMisionesConId(client);
  const slugById = new Map(misiones.map((m) => [m.id, m.slug]));

  const { data, error } = await client
    .from('mission_progress')
    .select('mission_id, status')
    .eq('user_id', userId);

  if (error) throw new Error(`No se pudo leer el progreso de misiones: ${error.message}`);
  return data.map((row) => ({
    missionSlug: slugById.get(row.mission_id) ?? row.mission_id,
    status: row.status,
  }));
}

export async function guardarProgresoMision(
  client: SupabaseClient<Database>,
  userId: string,
  missionSlug: string,
  status: MissionStatus,
): Promise<void> {
  const { data: mision, error: misionError } = await client
    .from('missions')
    .select('id')
    .eq('slug', missionSlug)
    .single();

  if (misionError) throw new Error(`No se encontró la misión ${missionSlug}: ${misionError.message}`);
  if (!mision) return;

  const { error } = await client
    .from('mission_progress')
    .upsert(
      { user_id: userId, mission_id: mision.id, status },
      { onConflict: 'user_id,mission_id' },
    );

  if (error) throw new Error(`No se pudo guardar el progreso de la misión: ${error.message}`);
}