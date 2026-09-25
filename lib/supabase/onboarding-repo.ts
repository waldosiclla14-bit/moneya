import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';

export interface PerfilInput {
  countryCode: 'CL' | 'PE';
  ageBucket: Database['public']['Enums']['age_bucket'];
  employmentStatus: Database['public']['Enums']['employment_status'];
}

export interface PerfilDecoded extends PerfilInput {
  countryId: number;
  createdAt: string;
  updatedAt: string;
}

const COUNTRY_CODE_TO_ID: Record<'CL' | 'PE', number> = { CL: 1, PE: 2 };

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function decodificarPerfil(row: ProfileRow): PerfilDecoded {
  return {
    countryCode: row.country_id === 2 ? 'PE' : 'CL',
    countryId: row.country_id,
    ageBucket: row.age_bucket,
    employmentStatus: row.employment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function guardarPerfil(
  client: SupabaseClient<Database>,
  userId: string,
  input: PerfilInput,
): Promise<PerfilDecoded> {
  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: userId,
        country_id: COUNTRY_CODE_TO_ID[input.countryCode],
        age_bucket: input.ageBucket,
        employment_status: input.employmentStatus,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (error) throw new Error(`No se pudo guardar el perfil: ${error.message}`);
  return decodificarPerfil(data);
}