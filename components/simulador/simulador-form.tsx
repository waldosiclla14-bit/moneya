'use client';

import { useMemo, useState } from 'react';
import {
  analizarSnapshot,
  simularEscenario,
  type Escenario,
  type FinancialSnapshot,
} from '../../lib/calculos';
import { MetricCard } from '../ui/metric-card';
import { SavePanel } from '../ui/save-panel';
import { useSession } from '../../lib/supabase/use-session';
import { createClientClient } from '../../lib/supabase/client';
import { guardarSimulacion } from '../../lib/supabase/simulation-repo';
import { registrarEvento } from '../../lib/supabase/events-repo';

type ScenarioType = Escenario['type'];

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  ingresos_menos: 'Ingresos bajan',
  gastos_mas: 'Gastos suben',
  perdida_ingreso: 'Pérdida de ingreso',
  emergencia: 'Gasto imprevisto',
  personalizado: 'Escenario personalizado',
};

const money = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const initialForm = {
  dependiente: '1000000',
  independiente: '0',
  esencial: '400000',
  noEsencial: '300000',
  liquidez: '1200000',
  deuda: '150000',
  scenarioType: 'ingresos_menos' as ScenarioType,
  pct: '30',
  monto: '500000',
  personalIncomePct: '-20',
  personalExpensePct: '10',
  personalExtra: '0',
};

export function SimuladorForm() {
  const { user, ready } = useSession();
  const [form, setForm] = useState(initialForm);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const snapshot: FinancialSnapshot = useMemo(
    () => ({
      income: { dependiente: toNum(form.dependiente), independiente: toNum(form.independiente), otros: 0 },
      expenses: { esencial: toNum(form.esencial), noEsencial: toNum(form.noEsencial) },
      liquidBalance: toNum(form.liquidez),
      debtMonthlyPayments: toNum(form.deuda),
    }),
    [form.dependiente, form.independiente, form.esencial, form.noEsencial, form.liquidez, form.deuda],
  );

  const escenario: Escenario = useMemo(() => {
    switch (form.scenarioType) {
      case 'ingresos_menos':
        return { type: 'ingresos_menos', pct: toNum(form.pct) / 100 };
      case 'gastos_mas':
        return { type: 'gastos_mas', pct: toNum(form.pct) / 100 };
      case 'perdida_ingreso':
        return { type: 'perdida_ingreso', pct: toNum(form.pct) / 100 };
      case 'emergencia':
        return { type: 'emergencia', monto: toNum(form.monto) };
      case 'personalizado':
        return {
          type: 'personalizado',
          incomePct: toNum(form.personalIncomePct) / 100,
          expensePct: toNum(form.personalExpensePct) / 100,
          extraExpense: toNum(form.personalExtra),
        };
    }
  }, [form.scenarioType, form.pct, form.monto, form.personalIncomePct, form.personalExpensePct, form.personalExtra]);

  const base = useMemo(() => analizarSnapshot(snapshot), [snapshot]);
  const proyeccion = useMemo(() => simularEscenario(snapshot, escenario), [snapshot, escenario]);

  async function guardar() {
    const client = createClientClient();
    if (!client || !user) return;

    const fecha = new Date().toLocaleDateString('es-CL');
    await guardarSimulacion(client, user.id, {
      name: `${SCENARIO_LABELS[form.scenarioType]} · ${fecha}`,
      snapshot,
      escenario,
    });
    void registrarEvento(client, user.id, 'simulation_created').catch(() => {});
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="font-display font-semibold">Tu mes actual</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Ingreso dependiente" value={form.dependiente} onChange={(v) => set('dependiente', v)} />
            <Field label="Ingreso independiente" value={form.independiente} onChange={(v) => set('independiente', v)} />
            <Field label="Gastos esenciales" value={form.esencial} onChange={(v) => set('esencial', v)} />
            <Field label="Gastos no esenciales" value={form.noEsencial} onChange={(v) => set('noEsencial', v)} />
            <Field label="Saldo líquido / ahorro" value={form.liquidez} onChange={(v) => set('liquidez', v)} />
            <Field label="Cuotas de deuda al mes" value={form.deuda} onChange={(v) => set('deuda', v)} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display font-semibold">Escenario «qué pasa si»</h2>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-sm text-neutral-600">Escenario</span>
              <select
                value={form.scenarioType}
                onChange={(e) => set('scenarioType', e.target.value as ScenarioType)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              >
                {Object.entries(SCENARIO_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {['ingresos_menos', 'gastos_mas', 'perdida_ingreso'].includes(form.scenarioType) && (
              <Field label="Porcentaje (%)" value={form.pct} onChange={(v) => set('pct', v)} suffix="% · 0–100" />
            )}
            {form.scenarioType === 'emergencia' && (
              <Field label="Monto del imprevisto" value={form.monto} onChange={(v) => set('monto', v)} />
            )}
            {form.scenarioType === 'personalizado' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ingresos (% delta, ej. -20)" value={form.personalIncomePct} onChange={(v) => set('personalIncomePct', v)} />
                <Field label="Gastos (% delta)" value={form.personalExpensePct} onChange={(v) => set('personalExpensePct', v)} />
                <Field label="Gasto extra puntual" value={form.personalExtra} onChange={(v) => set('personalExtra', v)} />
              </div>
            )}

            <p className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
              Bajo este escenario, tu flujo y tu cobertura cambian así:
            </p>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 font-semibold">Hoy</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard metric={base.mesesCobertura} />
            <MetricCard metric={base.ratioDeuda} />
            <MetricCard metric={base.concentracionIngreso} />
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">
            Proyección · <span className="text-neutral-500">{proyeccion.escenario}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              metric={proyeccion.proyectado.mesesCobertura}
              highlight={deltaHighlight(proyeccion.deltas.mesesCobertura)}
            />
            <MetricCard
              metric={proyeccion.proyectado.ratioDeuda}
              highlight={deltaHighlight(proyeccion.deltas.ratioDeuda)}
            />
            <MetricCard
              metric={{
                ...proyeccion.proyectado.mesesCobertura,
                key: 'ratio_ahorro',
                label: 'Flujo mensual',
                unit: 'moneda',
                value: proyeccion.proyectado.ahorroMensual,
                formula: 'Ingresos − gastos del mes',
                inputs: { ingresos: proyeccion.proyectado.ingresoMensual, gastos: proyeccion.proyectado.gastosMensuales },
              }}
              highlight={deltaHighlight(proyeccion.deltas.ratioAhorro)}
            />
          </div>

          {proyeccion.pasoAccionable && (
            <div className="mt-4 card p-4 text-sm text-neutral-800">
              <span className="font-medium">Sin obligación, un paso posible: </span>
              {proyeccion.pasoAccionable}
            </div>
          )}

          <SavePanel user={user} ready={ready} label="simulación" onSave={guardar} />
        </section>
      </div>
    </div>
  );
}

function deltaHighlight(delta: number | null): 'down' | 'up' | 'neutral' {
  if (delta === null || Math.abs(delta) < 0.005) return 'neutral';
  return delta < 0 ? 'down' : 'up';
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
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
      {suffix && <span className="text-xs text-neutral-400">{suffix}</span>}
    </label>
  );
}