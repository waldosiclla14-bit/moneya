'use client';

import { useEffect, useState } from 'react';
import { MISIONES, MISSION_STATUS_LABELS, type MissionStatus } from '../../lib/misiones';
import { useSession } from '../../lib/supabase/use-session';
import { createClientClient } from '../../lib/supabase/client';
import { listarProgresoMisiones, guardarProgresoMision, resetearProgresoMisiones } from '../../lib/supabase/misiones-progress-repo';
import { registrarEvento } from '../../lib/supabase/events-repo';

const STORAGE_KEY = 'moneya.mission_progress.v1';

type Progress = Record<string, MissionStatus>;

const STATUS_CYCLE: MissionStatus[] = ['no_iniciada', 'en_curso', 'completada'];

const STATUS_TONE: Record<MissionStatus, string> = {
  no_iniciada: 'bg-neutral-100 text-neutral-600',
  en_curso: 'bg-amber-50 text-amber-700',
  completada: 'bg-emerald-50 text-emerald-700',
};

function readProgress(): Progress {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function MisionesList() {
  const { user, ready } = useSession();
  const [progress, setProgress] = useState<Progress>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (user) {
      const client = createClientClient();
      if (!client) return;
      listarProgresoMisiones(client, user.id)
        .then((filas) => {
          const porSlug: Progress = {};
          for (const fila of filas) porSlug[fila.missionSlug] = fila.status;
          setProgress(porSlug);
          setHydrated(true);
        })
        .catch(() => {
          setProgress(readProgress());
          setHydrated(true);
        });
    } else {
      setProgress(readProgress());
      setHydrated(true);
    }
  }, [user, ready]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // storage no disponible: el progreso se mantiene solo en sesión
    }
  }, [progress, hydrated, user]);

  const completadas = MISIONES.filter((m) => progress[m.slug] === 'completada').length;
  const total = MISIONES.length;

  const ciclo = (actual: MissionStatus): MissionStatus =>
    STATUS_CYCLE[(STATUS_CYCLE.indexOf(actual) + 1) % STATUS_CYCLE.length];

  function cambiar(slug: string, next: MissionStatus) {
    const anterior = progress[slug];
    setProgress((p) => ({ ...p, [slug]: next }));
    if (user && hydrated) {
      const client = createClientClient();
      if (client) {
        void guardarProgresoMision(client, user.id, slug, next)
          .then(() => {
            if (next === 'completada' && anterior !== 'completada') {
              return registrarEvento(client, user.id, 'mission_completed');
            }
          })
          .catch((err) => console.error('No se pudo guardar el progreso', err));
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Progreso</span>
          <span className="text-sm font-semibold">
            {completadas} / {total}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(completadas / total) * 100}%` }}
          />
        </div>
        {completadas === total && (
          <p className="mt-3 text-sm text-emerald-700">
            ¡Completaste la ruta V1 de MONEYA! Las 5 misiones del MVP.
          </p>
        )}
      </div>

      <ol className="space-y-3">
        {MISIONES.map((mision) => {
          const status = progress[mision.slug] ?? 'no_iniciada';
          return (
            <li key={mision.slug} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-400">#{mision.sortOrder}</span>
                    <h3 className="font-semibold text-neutral-900">{mision.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{mision.description}</p>
                  <p className="mt-1 text-xs text-neutral-400">{mision.howToComplete}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[status]}`}>
                    {MISSION_STATUS_LABELS[status]}
                  </span>
                  <button
                    type="button"
                    onClick={() => cambiar(mision.slug, ciclo(status))}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-500"
                  >
                    Cambiar estado
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setProgress({});
            if (user && hydrated) {
              const client = createClientClient();
              if (client) {
                void resetearProgresoMisiones(client, user.id).catch((err) =>
                  console.error('No se pudo reiniciar el progreso', err),
                );
              }
            }
          }}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:border-red-400"
        >
          Reiniciar progreso
        </button>
      </div>
    </div>
  );
}