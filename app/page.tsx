import Link from 'next/link';
import { HeroDemo } from '../components/home/hero-demo';
import { Reveal } from '../components/ui/reveal';

const rutas = [
  { href: '/finanzas', t: 'Tu foto financiera', d: 'Ingresos, gastos y deuda en un snapshot mensual.' },
  { href: '/datos', t: 'Contexto LATAM', d: 'Indicadores de inclusión financiera con fuente. (V1: Global Findex 2025)' },
  { href: '/aprender', t: 'Aprender', d: 'Biblioteca de artículos sobre tus hábitos de dinero.' },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 py-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow">Bienestar financiero, no solo gastos</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            ¿Por qué tomas esas decisiones de dinero?
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            MONEYA combina un diagnóstico conductual validado con simulación de escenarios «qué pasa si».
            Todo calculado de forma transparente: cada resultado muestra su fórmula y sus inputs.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <Link href="/simular" className="btn-primary">
              Probar el simulador
            </Link>
            <Link href="/perfil" className="link-soft">
              o hacer el test de bienestar →
            </Link>
          </div>
          <p className="text-sm text-muted">
            Sin cuenta y sin registro · los cálculos corren en tu navegador
          </p>
        </div>
        <HeroDemo />
      </section>

      <Reveal>
        <section aria-label="Con qué te lo garantizamos">
          <ul className="grid gap-3 text-sm text-muted sm:grid-cols-2 lg:grid-cols-4">
            <li className="card flex items-center gap-2 p-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <Link href="/metodologia" className="link-soft">
                Fórmulas visibles en cada resultado
              </Link>
            </li>
            <li className="card flex items-center gap-2 p-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <Link href="/datos" className="link-soft">
                Datos con fuente · Global Findex 2025
              </Link>
            </li>
            <li className="card flex items-center gap-2 p-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <span>Tests de regresión bloquean cada deploy</span>
            </li>
            <li className="card flex items-center gap-2 p-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <span>Cálculo en tu navegador</span>
            </li>
          </ul>
        </section>
      </Reveal>

      <section>
        <p className="eyebrow mb-4">Empezar</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {rutas.map((c, i) => (
            <Reveal key={c.href} delay={i * 90}>
              <Link
                href={c.href}
                className="card block p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted/40 hover:shadow-md"
              >
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{c.t}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{c.d}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}