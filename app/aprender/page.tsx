import type { Metadata } from 'next';
import { Library } from '../../components/aprender/library';

export const metadata: Metadata = { title: 'Aprender — MONEYA' };

export default function AprenderPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">La biblioteca</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">Aprender</h1>
        <p className="mt-1 text-neutral-600">
          10 artículos originales de MONEYA sobre los 5 ejes con aplicación directa: margen de error,
          suficiente, consumo de estatus, riqueza invisible y suerte y riesgo.
        </p>
      </div>
      <Library />
    </div>
  );
}