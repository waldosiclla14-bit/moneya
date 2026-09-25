import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './db-types';
import type { Escenario, FinancialSnapshot, SimulationProyeccion } from '../calculos';
import { simularEscenario } from '../calculos';

export interface SimulationParams {
  snapshot: FinancialSnapshot;
  escenario: Escenario;
}

export interface SimulationDecoded {
  id: string;
  name: string;
  scenarioType: Database['public']['Enums']['scenario_type'];
  createdAt: string;
  params: SimulationParams;
  result: SimulationProyeccion;
}

export interface GuardarSimulacionInput {
  name: string;
  snapshot: FinancialSnapshot;
  escenario: Escenario;
}

type SimulationRow = Database['public']['Tables']['simulations']['Row'];

function toParams(snapshot: FinancialSnapshot, escenario: Escenario): Json {
  return { snapshot, escenario } as unknown as Json;
}

function toResult(result: SimulationProyeccion): Json {
  return result as unknown as Json;
}

function decodificarSimulacion(row: SimulationRow): SimulationDecoded {
  return {
    id: row.id,
    name: row.name,
    scenarioType: row.scenario_type,
    createdAt: row.created_at,
    params: row.params as unknown as SimulationParams,
    result: row.result as unknown as SimulationProyeccion,
  };
}

export async function guardarSimulacion(
  client: SupabaseClient<Database>,
  userId: string,
  input: GuardarSimulacionInput,
): Promise<SimulationDecoded> {
  const result = simularEscenario(input.snapshot, input.escenario);

  const { data, error } = await client
    .from('simulations')
    .insert({
      user_id: userId,
      name: input.name,
      scenario_type: input.escenario.type,
      params: toParams(input.snapshot, input.escenario),
      result: toResult(result),
    })
    .select()
    .single();

  if (error) throw new Error(`No se pudo guardar la simulación: ${error.message}`);
  return decodificarSimulacion(data);
}

export async function listarSimulaciones(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<SimulationDecoded[]> {
  const { data, error } = await client
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`No se pudieron listar las simulaciones: ${error.message}`);
  return data.map(decodificarSimulacion);
}

export async function eliminarSimulacion(
  client: SupabaseClient<Database>,
  userId: string,
  simulationId: string,
): Promise<void> {
  const { error } = await client
    .from('simulations')
    .delete()
    .eq('id', simulationId)
    .eq('user_id', userId);

  if (error) throw new Error(`No se pudo eliminar la simulación: ${error.message}`);
}