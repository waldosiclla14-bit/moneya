'use client';

import { useMemo, useState } from 'react';
import {
  analizarSnapshot,
  analizarAtenciones,
  sumaCuotas,
  equivalenciaHoras,
  ingresoTotal,
  HORAS_LABORABLES_MES_DEFAULT,
  DEUDA_TIPO_LABELS,
  type DeudaInput,
  type FinancialSnapshot,
  type LiabilityKind,
} from '../../lib/calculos';
import { SavePanel } from '../ui/save-panel';
import { useSession } from '../../lib/supabase/use-session';
import { createClientClient } from '../../lib/supabase/client';
import { guardarSnapshotFinanciero, guardarDeuda } from '../../lib/supabase/finanzas-repo';

const money = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

function formatoHoras(h: number): string {
  if (h <= 0) return '0';
  return h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString('es-CL');
}

function formatoMeses(v: number | null): string {
  if (v === null) return '—';
  return v < 10 ? v.toFixed(1) : Math.round(v).toString();
}

function formatoPorcentaje(v: number | null): string {
  if (v === null) return '—';
  return `${Math.round(v * 100)}%`;
}

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function nuevoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `d-${Date.now()}`;
}

const initialForm = {
  mes: '2026-09',
  dependiente: '1000000',
  independiente: '0',
  otros: '0',
  esencial: '400000',
  noEsencial: '300000',
  liquidez: '1200000',
};

const deudaVacia = (): DeudaInput => ({
  id: nuevoId(),
  nombre: '',
  tipo: 'tarjeta',
  saldo: 0,
  cuotaMensual: 0,
  tasaAnual: 0,
});

export function FotoFinanciera() {
  const { user, ready } = useSession();
  const [form, setForm] = useState(initialForm);
  const [deudas, setDeudas] = useState<DeudaInput[]>([]);
  const [gastoPuntual, setGastoPuntual] = useState('300000');
  const [horasLabMes, setHorasLabMes] = useState(String(HORAS_LABORABLES_MES_DEFAULT));

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const setDeuda = (id: string, patch: Partial<DeudaInput>) =>
    setDeudas((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const snapshot: FinancialSnapshot = useMemo(() => {
    const cuotas = sumaCuotas(deudas);
    return {
      income: {
        dependiente: toNum(form.dependiente),
        independiente: toNum(form.independiente),
        otros: toNum(form.otros),
      },
      expenses: { esencial: toNum(form.esencial), noEsencial: toNum(form.noEsencial) },
      liquidBalance: toNum(form.liquidez),
      debtMonthlyPayments: cuotas,
    };
  }, [form.dependiente, form.independiente, form.otros, form.esencial, form.noEsencial, form.liquidez, deudas]);

  const margen = useMemo(() => analizarSnapshot(snapshot), [snapshot]);

  const panorama = useMemo(() => analizarAtenciones(margen), [margen]);

  const ingresoMes = useMemo(() => ingresoTotal(snapshot.income), [snapshot]);

  const horasMes = Number(horasLabMes) > 0 ? Number(horasLabMes) : HORAS_LABORABLES_MES_DEFAULT;
  const equivalenciaPuntual = useMemo(
    () => equivalenciaHoras(toNum(gastoPuntual), ingresoMes, horasMes),
    [gastoPuntual, ingresoMes, horasMes],
  );
  const equivalenciaEsencial = useMemo(
    () => equivalenciaHoras(snapshot.expenses.esencial, ingresoMes, horasMes),
    [snapshot.expenses.esencial, ingresoMes, horasMes],
  );
  const equivalenciaNoEsencial = useMemo(
    () => equivalenciaHoras(snapshot.expenses.noEsencial, ingresoMes, horasMes),
    [snapshot.expenses.noEsencial, ingresoMes, horasMes],
  );

  async function guardar() {
    const client = createClientClient();
    if (!client || !user) return;

    await guardarSnapshotFinanciero(client, user.id, {
      snapshotMonth: form.mes,
      snapshot,
    });

    for (const deuda of deudas) {
      if (deuda.nombre.trim()) {
        await guardarDeuda(client, user.id, deuda);
      }
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="font-display font-semibold">Snapshot del mes</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Mes" value={form.mes} onChange={(v) => set('mes', v)} />
            <Field label="Saldo líquido / ahorro" value={form.liquidez} onChange={(v) => set('liquidez', v)} />
            <Field label="Ingreso dependiente" value={form.dependiente} onChange={(v) => set('dependiente', v)} />
            <Field label="Ingreso independiente" value={form.independiente} onChange={(v) => set('independiente', v)} />
            <Field label="Ingreso otros" value={form.otros} onChange={(v) => set('otros', v)} />
            <Field label="Gastos esenciales" value={form.esencial} onChange={(v) => set('esencial', v)} />
            <Field label="Gastos no esenciales" value={form.noEsencial} onChange={(v) => set('noEsencial', v)} />
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Deudas</h2>
            <button
              type="button"
              onClick={() => setDeudas((ds) => [...ds, deudaVacia()])}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-500"
            >
              + Agregar deuda
            </button>
          </div>

          {deudas.length === 0 && (
            <p className="mt-3 text-sm text-neutral-500">
              Sin deudas registradas: el ratio de deuda quedará en 0.
            </p>
          )}

          <div className="mt-3 space-y-4">
            {deudas.map((d) => (
              <div key={d.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Nombre" value={d.nombre} onChange={(v) => setDeuda(d.id, { nombre: v })} />
                  <label className="block">
                    <span className="text-sm text-neutral-600">Tipo</span>
                    <select
                      value={d.tipo}
                      onChange={(e) => setDeuda(d.id, { tipo: e.target.value as LiabilityKind })}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
                    >
                      {(Object.keys(DEUDA_TIPO_LABELS) as LiabilityKind[]).map((t) => (
                        <option key={t} value={t}>
                          {DEUDA_TIPO_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="Saldo" value={String(d.saldo)} onChange={(v) => setDeuda(d.id, { saldo: toNum(v) })} />
                  <Field label="Cuota mensual" value={String(d.cuotaMensual)} onChange={(v) => setDeuda(d.id, { cuotaMensual: toNum(v) })} />
                  <Field label="Tasa anual %" value={String(d.tasaAnual)} onChange={(v) => setDeuda(d.id, { tasaAnual: toNum(v) })} />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setDeudas((ds) => ds.filter((x) => x.id !== d.id))}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:border-red-400"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 font-display font-semibold">Panorama del mes</h2>

          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-600">Colchón · meses de gastos esenciales</p>
                <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink">
                  {formatoMeses(margen.mesesCobertura.value)}
                  <span className="ml-2 font-sans text-base font-medium text-neutral-500">meses</span>
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                  Tu saldo líquido de <span className="font-semibold text-neutral-700">{money.format(margen.liquidBalance)}</span>{' '}
                  cubre gastos esenciales de <span className="font-semibold text-neutral-700">{money.format(margen.gastosEsenciales)} por mes</span>.
                </p>
              </div>
              <EstadoColchon value={margen.mesesCobertura.value} />
            </div>
            <details className="mt-3 text-xs text-neutral-500">
              <summary className="cursor-pointer">Ver fórmula</summary>
              <p className="mt-1 italic">{margen.mesesCobertura.formula} · umbrales: &lt; 3 meses → atención · ≥ 3 base estándar · ≥ 6 sólido</p>
            </details>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-600">Deuda · % del ingreso en cuotas</span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${margen.ratioDeuda.value !== null && margen.ratioDeuda.value >= 0.4 ? 'bg-clay' : 'bg-emerald-600'}`}
                />
              </div>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
                {formatoPorcentaje(margen.ratioDeuda.value)}
              </p>
              <details className="mt-2 text-xs text-neutral-500">
                <summary className="cursor-pointer">Ver fórmula</summary>
                <p className="mt-1 italic">{margen.ratioDeuda.formula} · atención ≥ 40%</p>
              </details>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-600">Concentración · fuente principal</span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${margen.concentracionIngreso.value !== null && margen.concentracionIngreso.value >= 0.6 ? 'bg-clay' : 'bg-emerald-600'}`}
                />
              </div>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
                {formatoPorcentaje(margen.concentracionIngreso.value)}
              </p>
              <details className="mt-2 text-xs text-neutral-500">
                <summary className="cursor-pointer">Ver fórmula</summary>
                <p className="mt-1 italic">{margen.concentracionIngreso.formula} · atención ≥ 60%</p>
              </details>
            </div>
          </div>

          <div className="mt-3 card p-5">
            <p className="eyebrow">Qué necesita atención</p>
            <ul className="mt-3 space-y-4">
              {panorama.atenciones.map((a) => (
                <li key={a.clave} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.nivel === 'atencion' ? 'bg-clay' : 'bg-emerald-600'}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{a.titulo}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">{a.detalle}</p>
                    <details className="mt-1 text-xs text-neutral-500">
                      <summary className="cursor-pointer">Ver criterio</summary>
                      <p className="mt-1 italic">{a.formula}</p>
                    </details>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 card p-5">
            <p className="eyebrow">Un paso posible</p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink">{panorama.paso}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-display font-semibold">Resumen del mes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4 text-sm text-neutral-600">
              Ingreso total
              <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{money.format(margen.ingresoMensual)}</div>
            </div>
            <div className="card p-4 text-sm text-neutral-600">
              Gastos del mes
              <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{money.format(margen.gastosMensuales)}</div>
            </div>
            <div className="card p-4 text-sm text-neutral-600">
              Flujo del mes (sobra)
              <div
                className={`mt-1 font-display text-2xl font-semibold tracking-tight ${margen.ahorroMensual < 0 ? 'text-red-600' : 'text-ink'}`}
              >
                {money.format(margen.ahorroMensual)}
              </div>
            </div>
            <div className="card p-4 text-sm text-neutral-600">
              Deuda total
              <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                {money.format(deudas.reduce((a, d) => a + d.saldo, 0))}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Tu tiempo vale dinero</h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
              Your Money or Your Life
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Ver un gasto como horas de trabajo revela su costo real. Probá con una compra puntual.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Monto de la compra" value={gastoPuntual} onChange={setGastoPuntual} />
            <Field label="Horas trabajadas al mes" value={horasLabMes} onChange={setHorasLabMes} />
          </div>
          <div className="mt-3 rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600">
              Ingreso mensual actual:{' '}
              <span className="font-display font-semibold text-neutral-900">{money.format(ingresoMes)}</span> (~{' '}
              {money.format(equivalenciaPuntual.ingresoPorHora)} / hora)
            </div>
            <div className="mt-2 text-lg font-semibold text-neutral-900">
              Ese gasto equivale a ≈ {formatoHoras(equivalenciaPuntual.horas)} h de tu ingreso.
            </div>
            {(snapshot.expenses.esencial > 0 || snapshot.expenses.noEsencial > 0) && (
              <p className="mt-2 text-sm text-neutral-500">
                Este mes: gastos esenciales ≈ {formatoHoras(equivalenciaEsencial.horas)} h · gastos no esenciales ≈{' '}
                {formatoHoras(equivalenciaNoEsencial.horas)} h
              </p>
            )}
            <details className="mt-2 text-xs text-neutral-500">
              <summary className="cursor-pointer">Ver fórmula</summary>
              <p className="mt-1 italic">Horas = monto ÷ (ingreso mensual ÷ horas laborables del mes)</p>
            </details>
          </div>
        </section>

        <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          Cálculo local con fórmulas visibles en cada tarjeta. Con tu cuenta, el mes se guarda en{' '}
          <code className="mx-1 rounded bg-neutral-200 px-1 py-0.5 font-mono text-xs">financial_inputs</code> y las
          deudas en <code className="mx-1 rounded bg-neutral-200 px-1 py-0.5 font-mono text-xs">liabilities</code>{' '}
          (RLS ya lista en la migración 0001).
        </p>
        <SavePanel user={user} ready={ready} label="mes" onSave={guardar} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
      />
    </label>
  );
}

function EstadoColchon({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
        Por definir
      </span>
    );
  }
  if (value < 3) {
    return (
      <span className="shrink-0 rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clayDeep">
        Enfocar colchón
      </span>
    );
  }
  if (value < 6) {
    return (
      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        Base estándar
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      Sólido
    </span>
  );
}