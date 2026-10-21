'use client';

import { useMemo, useState } from 'react';
import { equivalenciaHoras, HORAS_LABORABLES_MES_DEFAULT } from '../../lib/calculos';
import { useRegion, type RegionContexto } from '../../lib/formato/region';

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatoHoras(h: number, numero: RegionContexto['numero']): string {
  if (h <= 0) return '0';
  return h < 10 ? h.toFixed(1) : numero(Math.round(h));
}

export function HeroDemo() {
  const [monto, setMonto] = useState('35000');
  const [ingreso, setIngreso] = useState('1000000');
  const [horas, setHoras] = useState(String(HORAS_LABORABLES_MES_DEFAULT));
  const { money, numero } = useRegion();

  const eq = useMemo(() => equivalenciaHoras(toNum(monto), toNum(ingreso), toNum(horas) || HORAS_LABORABLES_MES_DEFAULT), [monto, ingreso, horas]);

  return (
    <div className="card p-5">
      <p className="eyebrow">Demo en vivo</p>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">
        ¿Cuánto trabajo es esa compra?
      </h2>

      <div className="mt-4 space-y-3">
        <label htmlFor="demo-monto" className="block">
          <span className="text-sm text-neutral-600">Monto de la compra</span>
          <input
            id="demo-monto"
            type="text"
            inputMode="numeric"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label htmlFor="demo-ingreso" className="block">
            <span className="text-sm text-neutral-600">Ingreso mensual</span>
            <input
              id="demo-ingreso"
              type="text"
              inputMode="numeric"
              value={ingreso}
              onChange={(e) => setIngreso(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
            />
          </label>
          <label htmlFor="demo-horas" className="block">
            <span className="text-sm text-neutral-600">Horas al mes</span>
            <input
              id="demo-horas"
              type="text"
              inputMode="numeric"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-4 rounded-xl border border-hairline bg-cream p-4"
      >
        <p className="text-sm text-neutral-600">Eso equivale a ≈</p>
        <p className="font-display text-4xl font-semibold tracking-tight text-ink">
          {formatoHoras(eq.horas, numero)}
          <span className="ml-2 font-sans text-base font-medium text-neutral-500">horas de tu ingreso</span>
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          a {money.format(eq.ingresoPorHora)} / hora
        </p>
      </div>

      <details className="mt-3 text-xs text-neutral-500">
        <summary className="cursor-pointer">Ver fórmula</summary>
        <p className="mt-1 italic">{eq.formula}</p>
      </details>
      <p className="mt-3 text-xs text-neutral-500">
        La misma lógica corre en el simulador de MONEYA. Sin cuenta y sin conectar bancos.
      </p>
    </div>
  );
}