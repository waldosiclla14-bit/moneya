import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { NavLinks } from '../components/layout/nav-links';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MONEYA — Bienestar financiero',
  description: 'Entiende tus decisiones de dinero, no solo cuánto gastas. Diagnóstico conductual y simulación de escenarios.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-hairline bg-paper/90">
          <nav className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
              MONEYA<span className="text-clay">.</span>
            </Link>
            <NavLinks />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-hairline bg-cream py-6 text-center text-xs text-muted">
          <div className="mb-2 flex items-center justify-center gap-4">
            <Link href="/metodologia" className="link-soft">
              Metodología
            </Link>
            <Link href="/cuenta" className="link-soft">
              Mis datos
            </Link>
          </div>
          <p>MONEYA no es asesoría financiera ni de inversión. Los resultados son estimaciones bajo escenarios.</p>
          <p className="mt-1 text-[11px] text-muted/80">CL · PE — Global Findex 2025 · Decides con datos, no con miedo.</p>
        </footer>
      </body>
    </html>
  );
}