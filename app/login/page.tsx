import type { Metadata } from 'next';
import { LoginForm } from '../../components/auth/login-form';

export const metadata: Metadata = { title: 'Entrar — MONEYA' };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">Tu cuenta</h1>
        <p className="mt-1 text-neutral-600">
          Inicia sesión para guardar tu foto financiera, tu test y tu progreso en las misiones.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}