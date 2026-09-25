import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './db-types';
import type { AgeBucket, RespuestaItem, ResultadoWellbeing } from '../cfpb';
import { calcularWellbeing } from '../cfpb';

export interface WellbeingDecoded {
  id: string;
  createdAt: string;
  allItemsAnswered: boolean;
  score: number | null;
  dimensions: {
    control: number;
    shock: number;
    goals: number;
    freedom: number;
  };
}

export interface GuardarWellbeingInput {
  items: RespuestaItem[];
  ageBucket: AgeBucket;
}

type ResultRow = Database['public']['Tables']['wellbeing_results']['Row'];

function decodificarResultado(row: ResultRow): WellbeingDecoded {
  return {
    id: row.id,
    createdAt: row.created_at,
    allItemsAnswered: true,
    score: row.score,
    dimensions: {
      control: row.dimension_control,
      shock: row.dimension_shock,
      goals: row.dimension_goals,
      freedom: row.dimension_freedom,
    },
  };
}

export async function guardarBienestar(
  client: SupabaseClient<Database>,
  userId: string,
  input: GuardarWellbeingInput,
): Promise<{ decoded: WellbeingDecoded; result: ResultadoWellbeing }> {
  const result = calcularWellbeing(input.items, input.ageBucket);
  const itemsJson = input.items as unknown as Json;

  const { data: answers, error: answersError } = await client
    .from('wellbeing_answers')
    .insert({
      user_id: userId,
      items: itemsJson,
      all_items_answered: true,
    })
    .select()
    .single();

  if (answersError) throw new Error(`No se pudieron guardar las respuestas: ${answersError.message}`);

  const { data: results, error: resultsError } = await client
    .from('wellbeing_results')
    .insert({
      user_id: userId,
      answers_id: answers.id,
      score: result.score,
      dimension_control: result.dimensions.find((d) => d.key === 'dimension_control')?.value ?? 0,
      dimension_shock: result.dimensions.find((d) => d.key === 'dimension_shock')?.value ?? 0,
      dimension_goals: result.dimensions.find((d) => d.key === 'dimension_goals')?.value ?? 0,
      dimension_freedom: result.dimensions.find((d) => d.key === 'dimension_freedom')?.value ?? 0,
    })
    .select()
    .single();

  if (resultsError) throw new Error(`No se pudo guardar el resultado: ${resultsError.message}`);
  return { decoded: decodificarResultado(results), result };
}

export async function ultimoBienestar(client: SupabaseClient<Database>, userId: string): Promise<WellbeingDecoded | null> {
  const { data, error } = await client
    .from('wellbeing_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`No se pudo consultar el bienestar: ${error.message}`);
  return data ? decodificarResultado(data) : null;
}