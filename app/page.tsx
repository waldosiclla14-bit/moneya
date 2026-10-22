import Link from 'next/link';
import { HeroDemo } from '../components/home/hero-demo';
import { GoalGrid } from '../components/home/goal-grid';
import { ResumenHoy } from '../components/home/resumen-hoy';
import { Reveal } from '../components/ui/reveal';

export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-10">
      <section className="max-w-3xl space-y-3 pt-2 sm:space-y-4">
        <p className="eyebrow">Tu panel · bienestar financiero, no solo gastos</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          ¿Por qué tomas esas decisiones de dinero?
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
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
      </section>

      <Reveal>
        <ResumenHoy />
      </Reveal>

      <section className="grid items-start gap-6 lg:grid-cols-[1fr,1fr]">
        <HeroDemo />
        <div className="card space-y-3 p-4 sm:p-5">
          <p className="eyebrow">Por qué confiar</p>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <Link href="/metodologia" className="link-soft">
                Fórmulas visibles en cada resultado
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <Link href="/datos" className="link-soft">
                Datos con fuente · Global Findex 2025
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <span>Tests de regresión bloquean cada deploy</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              <span>Cálculo en tu navegador</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-3 sm:mb-4">Tus módulos · ¿qué quieres lograr hoy?</p>
        <GoalGrid />
      </section>
    </div>
  );
}
