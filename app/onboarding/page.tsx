import type { Metadata } from 'next';
import { PerfilForm } from '../../components/onboarding/perfil-form';

export const metadata: Metadata = { title: 'Onboarding — MONEYA' };

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tu perfil base</h1>
        <p className="mt-1 text-neutral-600">
          Tres datos que MONEYA usa para contextualizar tus números: el país ajusta la moneda y el contexto
          LATAM; el tramo de edad determina la columna del scoring CFPB; la situación laboral matiza la lectura
          de tus ingresos.
        </p>
      </div>
      <PerfilForm />
    </div>
  );
}