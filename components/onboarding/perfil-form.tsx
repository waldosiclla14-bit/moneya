'use client';

import { useState } from 'react';
import type { Database } from '../../lib/supabase/db-types';
import { CFPB_ITEMS } from '../../lib/cfpb';
import { PAISES } from '../../lib/datos';
import { SavePanel } from '../ui/save-panel';
import { useSession } from '../../lib/supabase/use-session';
import { createClientClient } from '../../lib/supabase/client';
import { guardarPerfil } from '../../lib/supabase/onboarding-repo';
import { registrarEvento } from '../../lib/supabase/events-repo';

const ONBOARDED_KEY = 'moneya.onboarded.v1';

type AgeBucket = Database['public']['Enums']['age_bucket'];
type EmploymentStatus = Database['public']['Enums']['employment_status'];

const EMPLOYMENT_LABELS: Record<EmploymentStatus, string> = {
  dependiente: 'Trabajo dependiente (sueldo)',
  independiente: 'Trabajo independiente / freelance',
  mixto: 'Mixto (dependiente + independiente)',
  estudiante: 'Estudiante',
  sin_empleo: 'Sin empleo',
  otro: 'Otro',
};

export function PerfilForm() {
  const { user, ready } = useSession();
  const [pais, setPais] = useState<'CL' | 'PE'>('CL');
  const [ageBucket, setAgeBucket] = useState<AgeBucket>('18_61');
  const [employment, setEmployment] = useState<EmploymentStatus>('dependiente');

  async function guardar() {
    const client = createClientClient();
    if (!client || !user) return;
    await guardarPerfil(client, user.id, {
      countryCode: pais,
      ageBucket,
      employmentStatus: employment,
    });

    let yaCompleto = false;
    try {
      yaCompleto = typeof window !== 'undefined' && window.localStorage.getItem(ONBOARDED_KEY) === '1';
    } catch {
      yaCompleto = true;
    }

    if (!yaCompleto) {
      void registrarEvento(client, user.id, 'onboarding_completed').catch(() => {});
      try {
        window.localStorage.setItem(ONBOARDED_KEY, '1');
      } catch {
        // sin almacenamiento local: el evento se cuenta en cada guardado inicial
      }
    }
    void registrarEvento(client, user.id, 'profile_saved').catch(() => {});
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm text-neutral-600">País</span>
          <select
            value={pais}
            onChange={(e) => setPais(e.target.value as 'CL' | 'PE')}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            {PAISES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name} ({p.currencyCode})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-neutral-600">Edad</span>
          <select
            value={ageBucket}
            onChange={(e) => setAgeBucket(e.target.value as AgeBucket)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="18_61">18 a 61 años</option>
            <option value="62_plus">62 años o más</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-neutral-600">Situación laboral</span>
          <select
            value={employment}
            onChange={(e) => setEmployment(e.target.value as EmploymentStatus)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            {(Object.keys(EMPLOYMENT_LABELS) as EmploymentStatus[]).map((s) => (
              <option key={s} value={s}>
                {EMPLOYMENT_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
        Tu test CFPB ({CFPB_ITEMS.length} afirmaciones) usará la columna de la escala para{' '}
        <span className="font-medium">{ageBucket === '62_plus' ? '62 años o más' : '18–61'}</span>, según la
        tabla oficial. Al conectar tu cuenta, este perfil se guarda en{' '}
        <code className="mx-1 rounded bg-neutral-200 px-1 py-0.5 font-mono text-xs">profiles</code>.
      </p>

      <div className="mt-4">
        <SavePanel user={user} ready={ready} label="perfil" onSave={guardar} />
      </div>
    </div>
  );
}