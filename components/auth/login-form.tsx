'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '../../lib/supabase/client';
import { supabaseEnvConfigured } from '../../lib/supabase/config';

type Modo = 'entrar' | 'crear';

export function LoginForm() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!supabaseEnvConfigured()) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">Supabase no está configurado todavía.</p>
        <p className="mt-2">
          Para activar el guardado por usuario, crea un proyecto en{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">supabase.com</code>, aplica las
          migraciones <code className="rounded bg-amber-100 px-1 font-mono text-xs">0001_create_schema</code>,{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">0002_seed_indicators</code> y{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">0003_seed_lessons</code>, y define en{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env</code> las variables de{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.example</code>.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const client = createClientClient();

    if (!client) return;

    try {
      if (modo === 'crear') {
        const { error: signUpError } = await client.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await client.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const client = createClientClient();
    if (!client) return;
    try {
      const { error: oauthError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/onboarding` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar con Google.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 card p-5">
      <div className="flex gap-2">
        {(['entrar', 'crear'] as Modo[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              modo === m ? 'bg-ink text-paper' : 'border border-hairline text-muted'
            }`}
          >
            {m === 'entrar' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-sm text-neutral-600">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-600">Contraseña</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full"
      >
        {busy ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
      </button>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        o
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="btn-secondary w-full"
      >
        Continuar con Google
      </button>
    </form>
  );
}