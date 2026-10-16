import type { Metadata } from 'next';
import { WellbeingTest } from '../../components/wellbeing/wellbeing-test';

export const metadata: Metadata = { title: 'Perfil — MONEYA' };

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Diagnóstico conductual</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Tu perfil de bienestar financiero</h1>
        <p className="mt-1 text-neutral-600">
          Test validado de bienestar financiero (escala CFPB, 10 preguntas). Puntaje único 0–100 y desglose
          descriptivo por 4 ejes; al conectar tu cuenta, tu resultado se sincroniza con ella.
        </p>
      </div>
      <WellbeingTest />
    </div>
  );
}