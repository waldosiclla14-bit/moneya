export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Bienestar financiero, no solo gastos
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          ¿Por qué tomas esas decisiones de dinero?
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          MONEYA combina un diagnóstico conductual validado con simulación de escenarios «qué pasa si».
          Todo calculado de forma transparente: cada resultado muestra su fórmula y sus inputs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/simular"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Probar el simulador
          </a>
          <a
            href="/perfil"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Hacer el test
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/finanzas', t: 'Tu foto financiera', d: 'Ingresos, gastos y deuda en un snapshot mensual.' },
          { href: '/datos', t: 'Contexto LATAM', d: 'Indicadores de inclusión financiera con fuente. (V1: Global Findex 2025)' },
          { href: '/aprender', t: 'Aprender', d: 'Biblioteca de artículos sobre tus hábitos de dinero.' },
        ].map((c) => (
          <a key={c.href} href={c.href} className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-300">
            <h2 className="font-semibold">{c.t}</h2>
            <p className="mt-1 text-sm text-neutral-600">{c.d}</p>
          </a>
        ))}
      </section>
    </div>
  );
}