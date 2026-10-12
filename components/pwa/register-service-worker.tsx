'use client';

import { useEffect } from 'react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {
        // registro best-effort: si falla, la app sigue funcionando online
      });
    };

    window.addEventListener('load', onLoad);
    function onLoad() {
      register();
    }
    if (document.readyState === 'complete') onLoad();

    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
