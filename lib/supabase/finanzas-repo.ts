import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import type { DeudaInput, FinancialSnapshot } from '../calculos';

export interface SnapshotDecoded {
  id: string;
  snapshotMonth: string;
  incomeDependiente: number;
  incomeIndependiente: number;
  incomeOtros: number;
  expensesEssential: number;
  expensesNonessential: number;
  liquidBalance: number;
  createdAt: string;
}

export interface DeudaDecoded extends DeudaInput {
  id: string;
  createdAt: string;
}

export interface GuardarSnapshotInput {
  snapshotMonth: string;
  snapshot: FinancialSnapshot;
}

type InputRow = Database['public']['Tables']['financial_inputs']['Row'];
type DeudaRow = Database['public']['Tables']['liabilities']['Row'];

function decodificarSnapshot(row: InputRow): SnapshotDecoded {
  return {
    id: row.id,
    snapshotMonth: row.snapshot_month,
    incomeDependiente: row.income_dependiente,
    incomeIndependiente: row.income_independiente,
    incomeOtros: row.income_otros,
    expensesEssential: row.expenses_essential,
    expensesNonessential: row.expenses_nonessential,
    liquidBalance: row.liquid_balance,
    createdAt: row.created_at,
  };
}

function decodificarDeuda(row: DeudaRow): DeudaDecoded {
  return {
    id: row.id,
    nombre: row.name,
    tipo: row.type,
    saldo: row.balance,
    cuotaMensual: row.monthly_payment,
    tasaAnual: row.annual_rate,
    createdAt: row.created_at,
  };
}

export async function guardarSnapshotFinanciero(
  client: SupabaseClient<Database>,
  userId: string,
  input: GuardarSnapshotInput,
): Promise<SnapshotDecoded> {
  const { data, error } = await client
    .from('financial_inputs')
    .insert({
      user_id: userId,
      snapshot_month: input.snapshotMonth,
      income_dependiente: input.snapshot.income.dependiente,
      income_independiente: input.snapshot.income.independiente,
      income_otros: input.snapshot.income.otros,
      expenses_essential: input.snapshot.expenses.esencial,
      expenses_nonessential: input.snapshot.expenses.noEsencial,
      liquid_balance: input.snapshot.liquidBalance,
    })
    .select()
    .single();

  if (error) throw new Error(`No se pudo guardar el snapshot: ${error.message}`);
  return decodificarSnapshot(data);
}

export async function listarSnapshots(client: SupabaseClient<Database>, userId: string): Promise<SnapshotDecoded[]> {
  const { data, error } = await client
    .from('financial_inputs')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_month', { ascending: false });

  if (error) throw new Error(`No se pudieron listar los snapshots: ${error.message}`);
  return data.map(decodificarSnapshot);
}

export async function guardarDeuda(client: SupabaseClient<Database>, userId: string, deuda: DeudaInput): Promise<DeudaDecoded> {
  const { data, error } = await client
    .from('liabilities')
    .insert({
      user_id: userId,
      name: deuda.nombre,
      type: deuda.tipo,
      balance: deuda.saldo,
      monthly_payment: deuda.cuotaMensual,
      annual_rate: deuda.tasaAnual,
    })
    .select()
    .single();

  if (error) throw new Error(`No se pudo guardar la deuda: ${error.message}`);
  return decodificarDeuda(data);
}

export async function listarDeudas(client: SupabaseClient<Database>, userId: string): Promise<DeudaDecoded[]> {
  const { data, error } = await client.from('liabilities').select('*').eq('user_id', userId);

  if (error) throw new Error(`No se pudieron listar las deudas: ${error.message}`);
  return data.map(decodificarDeuda);
}