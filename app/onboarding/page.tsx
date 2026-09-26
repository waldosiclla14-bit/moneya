import type { Metadata } from 'next';
import Link from 'next/link';
import { GoalGrid } from '../../components/home/goal-grid';
import { PerfilForm } from '../../components/onboarding/perfil-form';

export const metadata: Metadata = { title: 'Onboarding — MONEYA' };

export default function OnboardingPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="eyebrow mb-2">¿Qué quieres lograr hoy?</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Elegí tu punto de partida</h1>
        <p className="mt-1 max-w-2xl text-neutral-600">
          Cada objetivo te lleva directo a la herramienta que lo resuelve. MONEYA no te pide un formulario
          antes de darte respuesta.
        </p>
        <div className="mt-6">
          <GoalGrid />
        </div>
      </section>

      <section className="border-t border-hairline pt-8">
        <p className="eyebrow mb-2">Segundo paso (opcional ahora)</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Conocer tu perfil conductual</h2>
        <p className="mt-1 max-w-2xl text-neutral-600">
          Tres datos bases y el test validado del CFPB en 10 preguntas para contextualizar tus números.
          Podés completarlo ahora o después desde{' '}
          <Link href="/perfil" className="link-soft">
            Tu perfil de bienestar financiero
          </Link>
          .
        </p>
        <div className="mt-6">
          <PerfilForm />
        </div>
      </section>
    </div>
  );
}