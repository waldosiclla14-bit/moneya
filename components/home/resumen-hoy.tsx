'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  analizarSnapshot,
  sumaCuotas,
  type DeudaInput,
  type FinancialSnapshot,
} from '../../lib/calculos';
import { useRegion } from '../../lib/formato/region';
import { cargarDemo } from '../../lib/demo/seed-demo';

const STORAGE_KEY = 'moneya:foto:mes:v1';

type Guardado = {
  form?: {
    mes?: string;
    dependiente?: string;
    independiente?: string;
    otros?: string;
    esencial?: string;
    noEsencial?: string;
    liquidez?: string;
  };
  deudas?: Array<Partial<DeudaInput>>;
};

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatoMeses(v: number | null): string {
  if (v === null) return '—';
  return v < 10 ? v.toFixed(1) : Math.round(v).toString();
}

function formatoPorcentaje(v: number | null): string {
  if (v === null) return '—';
  return `${Math.round(v * 100)}%`;
}

export function ResumenHoy() {
  const { money } = useRegion();
  const [listo, setListo] = useState(false);
  const [semilla, setSemilla] = useState(0);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [mes, setMes] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const g = JSON.parse(raw) as Guardado;
        const f = g.form ?? {};
        const deudas: DeudaInput[] = (Array.isArray(g.deudas) ? g.deudas : []).map((d, i) => ({
          id: typeof d.id === 'string' ? d.id : `d-${i}`,
          nombre: typeof d.nombre === 'string' ? d.nombre : '',
          tipo: d.tipo ?? 'tarjeta',
          saldo: toNum(d.saldo),
          cuotaMensual: toNum(d.cuotaMensual),
          tasaAnual: toNum(d.tasaAnual),
        }));
        setSnapshot({
          income: {
            dependiente: toNum(f.dependiente),
            independiente: toNum(f.independiente),
            otros: toNum(f.otros),
          },
          expenses: { esencial: toNum(f.esencial), noEsencial: toNum(f.noEsencial) },
          liquidBalance: toNum(f.liquidez),
          debtMonthlyPayments: sumaCuotas(deudas),
        });
        setMes(typeof f.mes === 'string' ? f.mes : '');
      }
    } catch {
      /* dato ilegible: se muestra el llamado a armar la foto */
    }
    setListo(true);
  }, [semilla]);

  if (!listo) return null;

  if (!snapshot) {
    return (
      <section aria-label="Tu foto de hoy" className="card p-5">
        <p className="eyebrow">Tu foto de hoy</p>
        <p className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
          Aún no armas tu foto del mes
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          En 2 minutos ves tu colchón, tu ratio de deuda y tu flujo — todo calculado en tu navegador.
        </p>
        <Link href="/finanzas" className="btn-primary mt-4 inline-block">
          Armar mi foto del mes
        </Link>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              cargarDemo();
              setSemilla((s) => s + 1);
            }}
            className="link-soft text-sm"
          >
            o carga los datos de ejemplo para probar
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          La demo reemplaza lo guardado en este navegador.
        </p>
      </section>
    );
  }

  const margen = analizarSnapshot(snapshot);

  return (
    <section aria-label="Tu foto de hoy" className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Tu foto de hoy{mes ? ` · ${mes}` : ''}</p>
        <Link href="/finanzas" className="link-soft shrink-0 text-sm">
          Ver detalle →
        </Link>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-cream p-4">
          <p className="text-xs text-neutral-600">Colchón · meses que cubres lo esencial</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
            {formatoMeses(margen.mesesCobertura.value)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">Meta sana: ≥3 meses.</p>
        </div>
        <div className="rounded-xl bg-cream p-4">
          <p className="text-xs text-neutral-600">Deuda · % de tu ingreso que se va en cuotas</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
            {formatoPorcentaje(margen.ratioDeuda.value)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">Atención: ≥40%.</p>
        </div>
        <div className="rounded-xl bg-cream p-4">
          <p className="text-xs text-neutral-600">Flujo · lo que sobra en el mes</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
            {money.format(margen.ahorroMensual)}
          </p>
        </div>
      </div>
    </section>
  );
}
