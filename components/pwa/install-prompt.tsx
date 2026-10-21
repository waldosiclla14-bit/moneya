'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'moneya:install-dismissed:v1';

function esStandalone(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches;
}

export function InstallPrompt() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [modo, setModo] = useState<'boton' | 'ios' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') return;
    if (window.matchMedia?.('(display-mode: standalone)').matches) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      // sin localStorage no persistimos el descarte
    }

    const ua = navigator.userAgent;
    const esIOS = /iphone|ipad|ipod/i.test(ua);
    const esSafari = esIOS && !/(crios|fxios|edgios|opios)/i.test(ua);
    if (esSafari) setModo('ios');

    const handler = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
      setModo('boton');
    };
    const onInstalled = () => setModo(null);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function descartar() {
    setModo(null);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === 'accepted') setModo(null);
    setEvento(null);
  }

  if (!modo) return null;

  return (
    <div
      role="region"
      aria-label="Instalar MONEYA"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-neutral-300 bg-surface p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Instala MONEYA en tu teléfono</p>
          {modo === 'boton' ? (
            <p className="mt-0.5 text-xs text-neutral-600">Acceso directo y uso sin conexión, como una app.</p>
          ) : (
            <p className="mt-0.5 text-xs text-neutral-600">
              Toca <span className="font-medium">Compartir</span> y elige{' '}
              <span className="font-medium">Añadir a pantalla de inicio</span>.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={descartar}
          aria-label="Descartar"
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-neutral-400 hover:text-neutral-700"
        >
          ✕
        </button>
      </div>
      {modo === 'boton' && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={instalar}
            className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper hover:opacity-90"
          >
            Instalar app
          </button>
          <button type="button" onClick={descartar} className="link-soft px-3 py-2 text-sm">
            Ahora no
          </button>
        </div>
      )}
    </div>
  );
}
