'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/supabase/use-session';

// Guarda client-side para rutas que requieran sesión (J1: Pages estático,
// sin middleware). RLS en la DB sigue siendo la frontera real de seguridad;
// esto solo evita el destello de contenido protegido y redirige a /login.
// Las páginas demo (finanzas, perfil, simular…) se quedan abiertas a
// propósito: el posicionamiento es "sin cuenta y sin registro".
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
        Comprobando tu sesión…
      </p>
    );
  }

  return <>{children}</>;
}
