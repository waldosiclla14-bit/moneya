import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { NavLinks } from '../components/layout/nav-links';

export const metadata: Metadata = {
  title: 'MONEYA — Bienestar financiero',
  description: 'Entiende tus decisiones de dinero, no solo cuánto gastas. Diagnóstico conductual y simulación de escenarios.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-neutral-200 bg-white">
          <nav className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
            <a href="/" className="text-lg font-semibold tracking-tight">
              MONEYA
            </a>
            <NavLinks />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-500">
          <div className="mb-2 flex items-center justify-center gap-4">
            <a href="/metodologia" className="underline hover:text-neutral-700">
              Metodología
            </a>
            <a href="/cuenta" className="underline hover:text-neutral-700">
              Mis datos
            </a>
          </div>
          MONEYA no es asesoría financiera ni de inversión. Los resultados son estimaciones bajo escenarios.
        </footer>
      </body>
    </html>
  );
}