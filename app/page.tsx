import Link from 'next/link';

const rutas = [
  { href: '/finanzas', t: 'Tu foto financiera', d: 'Ingresos, gastos y deuda en un snapshot mensual.' },
  { href: '/datos', t: 'Contexto LATAM', d: 'Indicadores de inclusión financiera con fuente. (V1: Global Findex 2025)' },
  { href: '/aprender', t: 'Aprender', d: 'Biblioteca de artículos sobre tus hábitos de dinero.' },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="max-w-3xl space-y-6 py-6">
        <p className="eyebrow">Bienestar financiero, no solo gastos</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          ¿Por qué tomas esas decisiones de dinero?
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          MONEYA combina un diagnóstico conductual validado con simulación de escenarios «qué pasa si».
          Todo calculado de forma transparente: cada resultado muestra su fórmula y sus inputs.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/simular" className="btn-primary">
            Probar el simulador
          </Link>
          <Link href="/perfil" className="btn-secondary">
            Hacer el test
          </Link>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-4">Empezar</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {rutas.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted/40 hover:shadow-md"
            >
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{c.t}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}