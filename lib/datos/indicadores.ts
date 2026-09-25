import type { Database } from '../supabase/db-types';

export type IndicadorKey = Database['public']['Enums']['indicator_key'];

export interface IndicadorDef {
  key: IndicadorKey;
  label: string;
  definition: string;
  fndCode: string;
}

export interface PaisInfo {
  code: 'CL' | 'PE';
  name: string;
  currencyCode: string;
  locale: string;
}

export interface IndicadorValor {
  countryCode: PaisInfo['code'];
  key: IndicadorKey;
  value: number | null;
  year: number;
}

export interface FuenteInfo {
  sourceKey: string;
  name: string;
  institution: string;
  edition: string;
  dataYear: number;
  methodology: string;
  url: string;
  accessedAt: string;
  notes: string;
}

export const INDICADOR_DEFS: readonly IndicadorDef[] = [
  {
    key: 'account_ownership',
    label: 'Cuenta financiera',
    definition: '% de adultos con una cuenta (banco u otra institución financiera, o proveedor de dinero móvil).',
    fndCode: 'account.t.d / FX.OWN.TOTL.ZS',
  },
  {
    key: 'saved_formally_last_year',
    label: 'Ahorro formal el último año',
    definition: '% de adultos que ahorraron o guardaron dinero usando una cuenta en el último año.',
    fndCode: 'fin17a.17a1.d',
  },
  {
    key: 'formal_credit_access',
    label: 'Acceso a crédito formal',
    definition: '% de adultos que pidieron prestado a un banco u otra institución financiera formal.',
    fndCode: 'fin22a.22a1.22g.d',
  },
  {
    key: 'emergency_funds',
    label: 'Capacidad ante emergencias',
    definition: '% de adultos que podrían conseguir dinero extra en 30 días en caso de emergencia.',
    fndCode: 'fin11 / fin44',
  },
];

export const PAISES: readonly PaisInfo[] = [
  { code: 'CL', name: 'Chile', currencyCode: 'CLP', locale: 'es-CL' },
  { code: 'PE', name: 'Perú', currencyCode: 'PEN', locale: 'es-PE' },
];

export const VALORES: readonly IndicadorValor[] = [
  { countryCode: 'CL', key: 'account_ownership', value: 85.1, year: 2024 },
  { countryCode: 'CL', key: 'saved_formally_last_year', value: null, year: 2024 },
  { countryCode: 'CL', key: 'formal_credit_access', value: null, year: 2024 },
  { countryCode: 'CL', key: 'emergency_funds', value: null, year: 2024 },
  { countryCode: 'PE', key: 'account_ownership', value: null, year: 2024 },
  { countryCode: 'PE', key: 'saved_formally_last_year', value: null, year: 2024 },
  { countryCode: 'PE', key: 'formal_credit_access', value: null, year: 2024 },
  { countryCode: 'PE', key: 'emergency_funds', value: null, year: 2024 },
];

export const FUENTE: FuenteInfo = {
  sourceKey: 'global-findex-2025',
  name: 'Global Findex Database 2025',
  institution: 'Banco Mundial (World Bank)',
  edition: '2025 — 5ª edición',
  dataYear: 2024,
  methodology:
    'Encuesta nacional representativa de demanda (población 15+); ~145.000–148.000 adultos en 141 economías; trabajo de campo 2024. Publicado jul 2025. Uso CC BY-4.0. Cita recomendada: Klapper, L., Singer, D., Starita, L. y Norris, A. 2025. The Global Findex Database 2025: Connectivity and Financial Inclusion in the Digital Economy. World Bank, Washington, DC.',
  url: 'https://www.worldbank.org/en/publication/globalfindex',
  accessedAt: '2026-09-24',
  notes:
    'Valores por país descargables (Excel/CSV/Stata/Databank): https://www.worldbank.org/en/publication/globalfindex/download-data. En MONEYA solo se publica la cifra verificada: Chile 2024 cuenta = 85,1%. El resto queda en verificación; nunca se inventan valores.',
};