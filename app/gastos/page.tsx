import type { Metadata } from 'next';
import { GestorGastos } from '../../components/gastos/gestor-gastos';

export const metadata: Metadata = {
  title: 'Gastos — MONEYA',
  description: 'Registra tus gastos por categoría, con presupuesto mensual y exportación local.',
};

export default function GastosPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Gestor de gastos</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Tus gastos, en claro</h1>
        <p className="mt-1 max-w-2xl text-neutral-600">
          Registra cada gasto con su categoría y mira cuánto llevas y cuánto te queda del presupuesto. Todo se
          guarda en tu navegador.
        </p>
      </div>
      <GestorGastos />
    </div>
  );
}
