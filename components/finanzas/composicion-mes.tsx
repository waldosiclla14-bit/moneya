'use client';

import { useRegion } from '../../lib/formato/region';

type Props = {
  ingreso: number;
  esenciales: number;
  noEsenciales: number;
  cuotas: number;
};

type Segmento = {
  clave: string;
  etiqueta: string;
  valor: number;
  trazo: string;
  punto: string;
};

// Donut SVG puro (sin dependencias): la leyenda en texto real es el portador
// accesible de la información; el gráfico es aria-hidden.
const R = 48;
const C = 2 * Math.PI * R;
const GAP = 3;

export function ComposicionMes({ ingreso, esenciales, noEsenciales, cuotas }: Props) {
  const { money } = useRegion();

  const es = Math.max(0, esenciales);
  const ne = Math.max(0, noEsenciales);
  const cu = Math.max(0, cuotas);
  const ing = Math.max(0, ingreso);
  const salidas = es + ne + cu;

  if (ing <= 0 && salidas <= 0) {
    return (
      <p className="text-sm text-neutral-600">
        Agrega tu ingreso y tus gastos del mes para ver cómo se reparte.
      </p>
    );
  }

  const excede = salidas > ing;
  const base = excede ? salidas : ing;

  const segmentos: Segmento[] = [
    { clave: 'esencial', etiqueta: 'Gastos esenciales', valor: es, trazo: 'stroke-clay', punto: 'bg-clay' },
    {
      clave: 'no-esencial',
      etiqueta: 'Gastos no esenciales',
      valor: ne,
      trazo: 'stroke-amber-600',
      punto: 'bg-amber-600',
    },
    { clave: 'cuotas', etiqueta: 'Cuotas de deuda', valor: cu, trazo: 'stroke-neutral-500', punto: 'bg-neutral-500' },
    ...(excede
      ? []
      : [
          {
            clave: 'resto',
            etiqueta: 'Resto del ingreso',
            valor: ing - salidas,
            trazo: 'stroke-emerald-600',
            punto: 'bg-emerald-600',
          },
        ]),
  ].filter((s) => s.valor > 0);

  let acumulado = 0;
  const arcos = segmentos.map((s) => {
    const parte = (s.valor / base) * C;
    const arco = { ...s, longitud: Math.max(0, parte - GAP), desplazamiento: acumulado };
    acumulado += parte;
    return arco;
  });

  const excedente = Math.max(0, salidas - ing);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0 self-center sm:self-auto">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="14" className="stroke-neutral-200" />
          {arcos.map((a) => (
            <circle
              key={a.clave}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              strokeWidth="14"
              className={a.trazo}
              strokeDasharray={`${a.longitud} ${C - a.longitud}`}
              strokeDashoffset={-a.desplazamiento}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-neutral-600">{excede ? 'Salidas del mes' : 'Ingreso del mes'}</span>
          <span className="font-display text-base font-semibold text-ink">
            {money.format(excede ? salidas : ing)}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <ul className="space-y-2">
          {arcos.map((a) => (
            <li key={a.clave} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-neutral-600">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${a.punto}`} aria-hidden="true" />
                <span className="truncate">{a.etiqueta}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-medium text-ink">{money.format(a.valor)}</span>
                <span className="ml-2 text-neutral-500">{Math.round((a.valor / base) * 100)}%</span>
              </span>
            </li>
          ))}
        </ul>
        {excede && (
          <p className="mt-3 text-sm text-ink">
            Tus gastos y cuotas superan tu ingreso en{' '}
            <span className="font-semibold">{money.format(excedente)}</span>.
          </p>
        )}
        <details className="mt-3 text-xs text-neutral-500">
          <summary className="cursor-pointer">Ver fórmula</summary>
          <p className="mt-1 italic">
            Resto = ingreso − gastos esenciales − gastos no esenciales − cuotas. Si las salidas superan el
            ingreso, el gráfico muestra las salidas en vez del ingreso.
          </p>
        </details>
      </div>
    </div>
  );
}
