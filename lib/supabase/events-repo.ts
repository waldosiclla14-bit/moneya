import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './db-types';

export type EventName = Database['public']['Enums']['event_name'];

const EMPTY_PROPERTIES: Json = {};

export async function registrarEvento(
  client: SupabaseClient<Database>,
  userId: string,
  eventName: EventName,
  properties: Json = EMPTY_PROPERTIES,
): Promise<void> {
  const { error } = await client
    .from('events')
    .insert({ user_id: userId, event_name: eventName, properties });

  if (error) throw new Error(`No se pudo registrar el evento ${eventName}: ${error.message}`);
}