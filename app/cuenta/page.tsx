import type { Metadata } from 'next';
import { DatosUsuario } from '../../components/cuenta/datos-usuario';

export const metadata: Metadata = { title: 'Mis datos — MONEYA' };

export default function CuentaPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="eyebrow mb-2">Tu información</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">Mis datos</h1>
        <p className="mt-1 text-neutral-600">
          Portabilidad y borrado de tu información (PRD sección 13): exporta o elimina, es tuyo.
        </p>
      </div>
      <DatosUsuario />
    </div>
  );
}