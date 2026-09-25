import { describe, it, expect } from 'vitest';
import type { Database } from '../db-types';
import { decodificarPerfil } from '../onboarding-repo';
import { decodificarIndicador } from '../datos-repo';
import { decodificarMision } from '../misiones-repo';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type IndicatorRow = Database['public']['Tables']['indicators']['Row'];
type MissionRow = Database['public']['Tables']['missions']['Row'];

const perfilCL = (overrides: Partial<ProfileRow> = {}): ProfileRow => ({
  id: 'u-1',
  country_id: 1,
  age_bucket: '18_61',
  employment_status: 'dependiente',
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
  ...overrides,
});

describe('decodificadores (mapeo fila → dominio)', () => {
  it('perfil: country_id 1 → CL y 2 → PE', () => {
    expect(decodificarPerfil(perfilCL({ age_bucket: '62_plus' }))).toMatchObject({
      countryCode: 'CL',
      countryId: 1,
      ageBucket: '62_plus',
    });
    expect(
      decodificarPerfil(perfilCL({ country_id: 2, employment_status: 'independiente' })),
    ).toMatchObject({ countryCode: 'PE', employmentStatus: 'independiente' });
  });

  it('indicador: valora el fnd_code y mantiene la clave del enum', () => {
    const row: IndicatorRow = {
      id: 'i-1',
      indicator_key: 'account_ownership',
      country_id: 2,
      source_id: 's-1',
      value: 85.1,
      unit: '%',
      year: 2024,
      fnd_code: 'account.t.d',
    };
    expect(decodificarIndicador(row)).toMatchObject({
      countryCode: 'PE',
      indicatorKey: 'account_ownership',
      value: 85.1,
      fndCode: 'account.t.d',
    });
  });

  it('misión: traduce required_actions jsonb a arreglo de strings', () => {
    const row: MissionRow = {
      id: 'm-1',
      slug: 'mi-foto-financiera',
      title: 'Mi foto financiera',
      description: 'Guarda tu primer snapshot del mes.',
      sort_order: 1,
      required_actions: ['financial_inputs.created'] as unknown as Database['public']['Tables']['missions']['Row']['required_actions'],
    };
    const mision = decodificarMision(row);
    expect(mision.slug).toBe('mi-foto-financiera');
    expect(mision.requiredActions).toEqual(['financial_inputs.created']);
    expect(mision.howToComplete).toBe('');
  });

  it('misión tolera required_actions no-array', () => {
    const row: MissionRow = {
      id: 'm-2',
      slug: 'x',
      title: 'X',
      description: 'D',
      sort_order: 2,
      required_actions: null as unknown as MissionRow['required_actions'],
    };
    expect(decodificarMision(row).requiredActions).toEqual([]);
  });
});