'use client';

import { useEffect, useState } from 'react';
import type { MetricResult } from '../../lib/calculos';

const money = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

function prefiereMovimientoReducido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function formatMetricValue(m: MetricResult, value: number | null = m.value): string {
  if (value === null) return '—';
  switch (m.unit) {
    case 'meses':
      return `${Math.round(value)} meses`;
    case 'ratio':
    case 'porcentaje':
      return `${Math.round(value * 100)}%`;
    case 'moneda':
      return money.format(value);
  }
}

function useCountUp(target: number | null): number | null {
  const [value, setValue] = useState<number | null>(target);

  useEffect(() => {
    if (target === null) {
      setValue(null);
      return;
    }
    if (prefiereMovimientoReducido()) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 500;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

export function MetricCard({
  metric,
  highlight = 'neutral',
}: {
  metric: MetricResult;
  highlight?: 'neutral' | 'down' | 'up';
}) {
  const visible = useCountUp(metric.value);
  const tone =
    highlight === 'down'
      ? 'border-red-200 bg-red-50'
      : highlight === 'up'
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-neutral-200 bg-white';

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="text-sm text-neutral-600">{metric.label}</div>
      <div className="mt-1 font-display text-3xl font-semibold tracking-tight text-neutral-900">
        {formatMetricValue(metric, visible)}
      </div>
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