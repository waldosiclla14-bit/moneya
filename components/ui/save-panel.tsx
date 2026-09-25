'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function SavePanel({
  user,
  ready,
  label,
  onSave,
}: {
  user: User | null;
  ready: boolean;
  label: string;
  onSave: () => Promise<void>;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!ready) return null;

  if (!user) {
    return (
      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
        Inicia sesión para guardar este {label}:{' '}
        <Link href="/login" className="underline">
          Entrar
        </Link>{' '}
        (hoy todo se calcula localmente en tu navegador).
      </p>
    );
  }

  async function handle() {
    setStatus('saving');
    setError(null);
    try {
      await onSave();
      setStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo.');
      setStatus('error');
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handle}
        disabled={status === 'saving'}
        className="btn-primary"
      >
        {status === 'saving' ? 'Guardando…' : status === 'saved' ? 'Guardado' : `Guardar ${label}`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}