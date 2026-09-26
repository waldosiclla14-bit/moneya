import Link from 'next/link';
import type { ReactNode } from 'react';
import { Reveal } from '../ui/reveal';

const icono = 'h-5 w-5';

const rutas: { href: string; t: string; d: string; icon: ReactNode }[] = [
  {
    href: '/finanzas',
    t: 'Armar mi colchón',
    d: 'Cuántos meses te sostiene tu saldo líquido frente a tus gastos esenciales.',
    icon: (
      <svg viewBox="0 0 24 24" className={icono} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M8 17v-3" />
        <path d="M13 17V7" />
        <path d="M18 17v-6" />
      </svg>
    ),
  },
  {
    href: '/finanzas',
    t: 'Entender mi deuda',
    d: 'Ratio de deuda: cuánto de tu ingreso se va en cuotas y cuál pesa más.',
    icon: (
      <svg viewBox="0 0 24 24" className={icono} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="m16.71 13.88.7.71-2.82 2.82" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    t: 'Saber por qué decido así',
    d: 'Test conductual validado (CFPB) en 10 preguntas, sin puntaje moral.',
    icon: (
      <svg viewBox="0 0 24 24" className={icono} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      </svg>
    ),
  },
  {
    href: '/simular',
    t: 'Probar un «qué pasa si»',
    d: 'Cambia un número y mira el efecto en tu cobertura, deuda y flujo.',
    icon: (
      <svg viewBox="0 0 24 24" className={icono} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="16" x2="16" y1="14" y2="18" />
        <path d="M16 10h.01" />
        <path d="M12 10h.01" />
        <path d="M8 10h.01" />
        <path d="M12 14h.01" />
        <path d="M8 14h.01" />
        <path d="M12 18h.01" />
        <path d="M8 18h.01" />
      </svg>
    ),
  },
  {
    href: '/datos',
    t: 'Ver mi contexto',
    d: 'Cómo se mueve el dinero en Chile y Perú, con cifras de Global Findex 2025.',
    icon: (
      <svg viewBox="0 0 24 24" className={icono} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    href: '/aprender',
    t: 'Aprender sobre hábitos',
    d: 'La biblioteca de MONEYA: los 5 ejes con aplicación directa, sin jerga.',
    icon: (
      <svg viewBox="0 0 24 24" className={icono} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
];

export function GoalGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rutas.map((c, i) => (
        <Reveal key={c.href} delay={i * 90}>
          <Link
            href={c.href}
            className="card block h-full p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted/40 hover:shadow-md"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-clayDeep">
              {c.icon}
            </span>
            <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">{c.t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{c.d}</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}