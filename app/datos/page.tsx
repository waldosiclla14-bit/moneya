import type { Metadata } from 'next';
import { ContextoLatam } from '../../components/datos/contexto-latam';

export const metadata: Metadata = { title: 'Datos LATAM — MONEYA' };

export default function DatosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Contexto LATAM</h1>
        <p className="mt-1 text-neutral-600">
          4 indicadores de Global Findex 2025 (Banco Mundial) para Chile y Perú. Solo cifras verificadas: Perú
          cuenta 59,3% · ahorro formal 31,4% · crédito formal 20,8% y Chile cuenta 85,1%.
        </p>
      </div>
      <ContextoLatam />
    </div>
  );
}