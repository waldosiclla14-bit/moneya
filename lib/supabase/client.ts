import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import { supabaseUrl, supabaseAnonKey } from './config';

let client: SupabaseClient<Database> | null = null;

export function createClientClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}