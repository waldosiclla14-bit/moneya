import type { Metadata } from 'next';
import { ContextoLatam } from '../../components/datos/contexto-latam';

export const metadata: Metadata = { title: 'Datos LATAM — MONEYA' };

export default function DatosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contexto LATAM</h1>
        <p className="mt-1 text-neutral-600">
          4 indicadores de Global Findex 2025 (Banco Mundial) para Chile y Perú. MONEYA solo publica cifras
          verificadas: hoy, la cobertura de cuenta de Chile (85,1%, 2024).
        </p>
      </div>
      <ContextoLatam />
    </div>
  );
}