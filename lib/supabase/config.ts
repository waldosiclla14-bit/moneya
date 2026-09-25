export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseEnvConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey);
}