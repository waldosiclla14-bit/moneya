'use client';

import { useMemo, useState } from 'react';
import {
  CFPB_ITEMS,
  AGE_BUCKET_LABELS,
  blockLabel,
  optionsDe,
  calcularWellbeing,
  type AgeBucket,
  type RespuestaItem,
} from '../../lib/cfpb';
import { SavePanel } from '../ui/save-panel';
import { useSession } from '../../lib/supabase/use-session';
import { createClientClient } from '../../lib/supabase/client';
import { guardarBienestar } from '../../lib/supabase/wellbeing-repo';
import { registrarEvento } from '../../lib/supabase/events-repo';
import { PREGUNTAS_EXPLORATORIAS } from '../../lib/perfil';

export function WellbeingTest() {
  const { user, ready } = useSession();
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [exploratorias, setExploratorias] = useState<Record<string, number>>({});
  const [ageBucket, setAgeBucket] = useState<AgeBucket>('18_61');

  const contestadas = CFPB_ITEMS.filter((i) => respuestas[i.key] !== undefined).length;
  const completas = contestadas === CFPB_ITEMS.length;

  const respuestasLista: RespuestaItem[] = useMemo(
    () =>
      CFPB_ITEMS.filter((i) => respuestas[i.key] !== undefined).map((i) => ({
        key: i.key,
        response: respuestas[i.key] as number,
      })),
    [respuestas],
  );

  const resultado = useMemo(
    () => (completas ? calcularWellbeing(respuestasLista, ageBucket) : null),
    [completas, respuestasLista, ageBucket],
  );

  async function guardar() {
    const client = createClientClient();
    if (!client || !user || !completas) return;
    await guardarBienestar(client, user.id, { items: respuestasLista, ageBucket });
    void registrarEvento(client, user.id, 'test_completed').catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Escala de Bienestar Financiero del CFPB</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Son 10 afirmaciones validadas (dominio público). Responde todas: obtienes un puntaje CFPB 0–100 y
          un desglose descriptivo por 4 ejes.
        </p>
      </div>

      {(['describe', 'frequency'] as const).map((bloque) => (
        <section key={bloque} className="rounded-xl border border-neutral-200 bg-white p-5">
          <h3 className="font-semibold">{blockLabel(bloque)}</h3>
          <div className="mt-4 space-y-6">
            {CFPB_ITEMS.filter((i) => i.block === bloque).map((item) => (
              <fieldset key={item.key}>
                <legend className="text-sm font-medium text-neutral-800">
                  {item.number}. {item.item}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {optionsDe(item.block).map((op) => (
                    <label
                      key={op.value}
                      className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700"
                    >
                      <input
                        type="radio"
                        name={item.key}
                        className="mr-2"
                        checked={respuestas[item.key] === op.value}
                        onChange={() => setRespuestas((r) => ({ ...r, [item.key]: op.value }))}
                      />
                      {op.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="font-semibold">Sobre ti</h3>
        <p className="mt-1 text-sm text-neutral-500">
          El puntaje CFPB se ajusta por tramo de edad según la tabla oficial.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(AGE_BUCKET_LABELS) as AgeBucket[]).map((bucket) => (
            <label
              key={bucket}
              className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700"
            >
              <input
                type="radio"
                name="age_bucket"
                className="mr-2"
                checked={ageBucket === bucket}
                onChange={() => setAgeBucket(bucket)}
              />
              {AGE_BUCKET_LABELS[bucket]}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="font-semibold">Tus hábitos de dinero <span className="text-xs font-normal text-neutral-400">· exploratorio</span></h3>
        <p className="mt-1 text-sm text-neutral-500">
          10 preguntas propias de MONEYA para reflexionar. No generan puntaje: son exploratorias y
          no están validadas científicamente como la escala CFPB.
        </p>
        <div className="mt-4 space-y-5">
          {PREGUNTAS_EXPLORATORIAS.map((p, idx) => (
            <fieldset key={p.key}>
              <legend className="text-sm font-medium text-neutral-800">
                {idx + 1}. {p.question}
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-5">
                {p.options.map((op) => (
                  <label
                    key={op.value}
                    className="cursor-pointer rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-xs text-neutral-700"
                  >
                    <input
                      type="radio"
                      name={p.key}
                      className="mr-1"
                      checked={exploratorias[p.key] === op.value}
                      onChange={() => setExploratorias((r) => ({ ...r, [p.key]: op.value }))}
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {!completas && (
        <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          Respondiste {contestadas} de {CFPB_ITEMS.length} afirmaciones.
        </p>
      )}

      {completas && resultado && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-900">Tu puntaje CFPB</h2>
          <div className="mt-2 font-display text-4xl font-semibold tracking-tight text-emerald-900">
            {resultado.score} <span className="text-lg font-semibold">/ 100</span>
          </div>
          <p className="mt-2 text-sm text-emerald-800">{resultado.note}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {resultado.dimensions.map((d) => (
              <div key={d.key} className="rounded-lg border border-emerald-100 bg-white p-4">
                <div className="text-sm text-neutral-600">{d.label}</div>
                <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-neutral-900">{d.value} / 100</div>
                <details className="mt-2 text-xs text-neutral-500">
                  <summary className="cursor-pointer">Ver fórmula e ítems</summary>
                  <p className="mt-1 italic">{d.formula}</p>
                  <ul className="mt-1 space-y-0.5">
                    {d.items.map((key) => {
                      const item = CFPB_ITEMS.find((i) => i.key === key);
                      return (
                        <li key={key}>
                          <span className="font-mono">{key}</span> · {item?.number}. {item?.item}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-1">
                    <span className="font-mono">promedio</span> = {d.inputs.promedio}
                  </p>
                </details>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <SavePanel user={user} ready={ready} label="test" onSave={guardar} />
          </div>
        </section>
      )}
    </div>
  );
}