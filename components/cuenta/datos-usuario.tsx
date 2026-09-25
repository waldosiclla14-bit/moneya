'use client';

import { useState } from 'react';
import { useSession } from '../../lib/supabase/use-session';
import { createClientClient } from '../../lib/supabase/client';
import { exportarDatosUsuario, eliminarDatosUsuario } from '../../lib/supabase/datos-usuario-repo';

export function DatosUsuario() {
  const { user, ready } = useSession();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return null;

  if (!user) {
    return (
      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
        Inicia sesión para exportar o eliminar tus datos:{' '}
        <a href="/login" className="underline">
          Entrar
        </a>
        .
      </p>
    );
  }

  const userId = user.id;

  async function exportar() {
    setBusy(true);
    setError(null);
    setMensaje(null);
    try {
      const client = createClientClient();
      if (!client) return;
      const datos = await exportarDatosUsuario(client, userId);
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneya-datos-${userId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMensaje('Exportación lista. El archivo se descargó en tu navegador.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar.');
    } finally {
      setBusy(false);
    }
  }

  async function eliminar() {
    const confirmado = window.confirm(
      'Esto borra tus snapshots, deudas, test, simulaciones, misiones y tu perfil de MONEYA. No se puede deshacer. La cuenta en sí (email/contraseña) la gestionas desde Supabase Auth.',
    );
    if (!confirmado) return;

    setBusy(true);
    setError(null);
    setMensaje(null);
    try {
      const client = createClientClient();
      if (!client) return;
      await eliminarDatosUsuario(client, userId);
      setMensaje('Tus datos de MONEYA fueron eliminados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron eliminar los datos.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-600">
        Exportar genera un archivo JSON con todo lo que MONEYA guarda de ti. Eliminar borra esos mismos datos de
        la base (los registros de auditoría interna se conservan por seguridad).
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportar}
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          Exportar mis datos (JSON)
        </button>
        <button
          type="button"
          onClick={eliminar}
          disabled={busy}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:border-red-400 disabled:opacity-50"
        >
          Eliminar mis datos
        </button>
      </div>
      {mensaje && <p className="text-sm text-emerald-700">{mensaje}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}