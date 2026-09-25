import type { MetricResult } from '../../lib/calculos';

const money = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

export function formatMetricValue(m: MetricResult): string {
  if (m.value === null) return '—';
  switch (m.unit) {
    case 'meses':
      return `${m.value} meses`;
    case 'ratio':
    case 'porcentaje':
      return `${Math.round(m.value * 100)}%`;
    case 'moneda':
      return money.format(m.value);
  }
}

export function MetricCard({
  metric,
  highlight = 'neutral',
}: {
  metric: MetricResult;
  highlight?: 'neutral' | 'down' | 'up';
}) {
  const tone =
    highlight === 'down'
      ? 'border-red-200 bg-red-50'
      : highlight === 'up'
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-neutral-200 bg-white';

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="text-sm text-neutral-600">{metric.label}</div>
      <div className="mt-1 font-display text-3xl font-semibold tracking-tight text-neutral-900">{formatMetricValue(metric)}</div>
      <details className="mt-2 text-xs text-neutral-500">
        <summary className="cursor-pointer">Ver fórmula e inputs</summary>
        <p className="mt-1 italic">{metric.formula}</p>
        <ul className="mt-1 space-y-0.5">
          {Object.entries(metric.inputs).map(([k, v]) => (
            <li key={k}>
              <span className="font-mono">{k}</span> = {money.format(v)}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}