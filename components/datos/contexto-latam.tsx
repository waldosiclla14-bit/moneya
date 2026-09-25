import { INDICADOR_DEFS, PAISES, VALORES, FUENTE } from '../../lib/datos';

export function ContextoLatam() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {PAISES.map((pais) => {
          const filas = VALORES.filter((v) => v.countryCode === pais.code);
          return (
            <section key={pais.code} className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="font-semibold">{pais.name}</h2>
              <div className="mt-4 space-y-3">
                {INDICADOR_DEFS.map((def) => {
                  const valor = filas.find((f) => f.key === def.key);
                  const verificado = valor && valor.value !== null;
                  return (
                    <div key={def.key} className="border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-neutral-700">{def.label}</span>
                        {verificado ? (
                          <span className="text-lg font-semibold text-neutral-900">{valor?.value}%</span>
                        ) : (
                          <span className="text-xs text-neutral-400">En verificación</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{def.definition}</p>
                      {!verificado && (
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Código Findex: <span className="font-mono">{def.fndCode}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <details className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
        <summary className="cursor-pointer font-medium text-neutral-800">Ficha de la fuente</summary>
        <div className="mt-3 space-y-2 text-neutral-700">
          <p>
            <span className="font-medium">Fuente:</span> {FUENTE.name} ({FUENTE.edition}) · {FUENTE.institution}.
          </p>
          <p>{FUENTE.methodology}</p>
          <p>
            <span className="font-medium">Accedida:</span> {FUENTE.accessedAt} ·{' '}
            <a href={FUENTE.url} target="_blank" rel="noreferrer" className="text-sky-700 underline">
              {FUENTE.url}
            </a>
          </p>
        </div>
      </details>

      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
        {FUENTE.notes}
      </p>
    </div>
  );
}