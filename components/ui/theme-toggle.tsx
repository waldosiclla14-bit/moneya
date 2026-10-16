'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'moneya:tema';

export type Tema = 'claro' | 'oscuro';

export function aplicarTema(tema: Tema): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', tema === 'oscuro');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', tema === 'oscuro' ? '#1F1E1D' : '#FAF9F5');
}

function leerTema(): Tema {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'oscuro' ? 'oscuro' : 'claro';
  } catch {
    return 'claro';
  }
}

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>('claro');

  useEffect(() => {
    const inicial = leerTema();
    setTema(inicial);
    aplicarTema(inicial);
  }, []);

  function alternar() {
    const siguiente: Tema = tema === 'oscuro' ? 'claro' : 'oscuro';
    setTema(siguiente);
    try {
      window.localStorage.setItem(STORAGE_KEY, siguiente);
    } catch {
      /* sin almacenamiento: el tema dura la sesión */
    }
    aplicarTema(siguiente);
  }

  const oscuro = tema === 'oscuro';

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={oscuro}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-surface text-muted transition-colors hover:text-ink"
    >
      {oscuro ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
