import type { Metadata } from 'next';
import { SimuladorForm } from '../../components/simulador/simulador-form';

export const metadata: Metadata = {
  title: 'Simular — MONEYA',
  description: 'Simulador «qué pasa si»: calcula cómo cambian tu cobertura, deuda y flujo bajo distintos escenarios.',
};

export default function SimularPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow mb-2">Explorar escenarios</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Simulador «qué pasa si»</h1>
        <p className="mt-1 max-w-2xl text-neutral-600">
          Ingresos, gastos, deuda y ahorro + un escenario. Cada resultado muestra su fórmula y sus inputs. Nada se calcula en texto libre.
        </p>
      </section>
      <SimuladorForm />
    </div>
  );
}