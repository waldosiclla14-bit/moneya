import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import { supabaseUrl, supabaseAnonKey } from './config';

export function createServerClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase no configurado en el servidor: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}