import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import type { IndicadorKey, PaisInfo } from '../datos';

export interface IndicadorDecoded {
  id: string;
  countryCode: PaisInfo['code'];
  countryId: number;
  indicatorKey: IndicadorKey;
  value: number | null;
  unit: string;
  year: number;
  fndCode: string | null;
}

type IndicatorRow = Database['public']['Tables']['indicators']['Row'];

const COUNTRY_ID_TO_CODE: Record<number, PaisInfo['code']> = { 1: 'CL', 2: 'PE' };

export function decodificarIndicador(row: IndicatorRow): IndicadorDecoded {
  return {
    id: row.id,
    countryCode: COUNTRY_ID_TO_CODE[row.country_id] ?? 'CL',
    countryId: row.country_id,
    indicatorKey: row.indicator_key,
    value: row.value,
    unit: row.unit,
    year: row.year,
    fndCode: row.fnd_code,
  };
}

export async function listarIndicadoresLatam(client: SupabaseClient<Database>): Promise<IndicadorDecoded[]> {
  const { data, error } = await client.from('indicators').select('*').order('country_id', { ascending: true });

  if (error) throw new Error(`No se pudieron listar los indicadores: ${error.message}`);
  return data.map(decodificarIndicador);
}