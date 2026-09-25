import type { Metadata } from 'next';
import { FotoFinanciera } from '../../components/finanzas/foto-financiera';

export const metadata: Metadata = { title: 'Finanzas — MONEYA' };

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tu foto financiera</h1>
        <p className="mt-1 text-neutral-600">
          Captura tu mes: ingresos por fuente, gastos y saldo líquido, más tus deudas. Verás tus tres números
          (meses de cobertura, ratio de deuda y concentración de ingreso) calculados al instante, cada uno con
          su fórmula visible.
        </p>
      </div>
      <FotoFinanciera />
    </div>
  );
}