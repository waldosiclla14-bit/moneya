import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Metodología — MONEYA' };

const reglas = [
  'Ningún texto usa lenguaje de garantía ni de culpa: los resultados son condicionales a un escenario.',
  'Todo cálculo se muestra con su fórmula y sus inputs; nada queda opaco.',
  'Lo validado (CFPB) y lo exploratorio se etiquetan por separado.',
  'MONEYA no es asesoría financiera ni de inversión, no recomienda productos, y sus escenarios informan, no predicen.',
];

export default function MetodologiaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Metodología</h1>
        <p className="mt-1 max-w-2xl text-neutral-600">
          Cómo calcula MONEYA cada número y de dónde vienen los datos. Actualizado al 24 de septiembre de 2026.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Score de bienestar financiero (CFPB)</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Se usa la CFPB Financial Well-Being Scale (10 ítems), escala validada y de dominio público. El score se
          calcula con el método IRT original: cada respuesta se codifica 0–4 y se suma en un total de rango 0–40.
          Ese total se mapea a un score 0–100 usando la tabla de normas nacionales oficiales, con dos columnas por
          tramo de edad (18–61 y 62+). Requisitos de validez de la CFPB: no se altera la redacción de los ítems,
          no se permiten respuestas omitidas y se usa el tramo de edad correcto.
        </p>
        <details className="mt-3 text-sm text-neutral-600">
          <summary className="cursor-pointer font-medium">Ver cómo se mapea</summary>
          <p className="mt-2">
            Ejemplo: un total de 12 puntos equivale a un score de 40 (tramo 18–61) y 42 (tramo 62+). Cada total
            0–40 tiene su puntaje en las tablas oficiales; el desglose en 4 ejes (control, shock, metas, libertad)
            es una lectura descriptiva, no un psicométrico separado.
          </p>
        </details>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Tus tres números financieros</h2>
        <div className="mt-3 space-y-3 text-sm text-neutral-700">
          <p>
            <span className="font-medium">Meses de cobertura</span> = saldo líquido ÷ gastos esenciales. Cuántos
            meses cubre tu colchón solo con gastos esenciales.
          </p>
          <p>
            <span className="font-medium">Ratio de deuda</span> = pagos mensuales de deuda ÷ ingreso mensual. Qué
            parte de tu ingreso se compromete en cuotas.
          </p>
          <p>
            <span className="font-medium">Concentración de ingreso</span> = ingreso de la fuente principal ÷ ingreso
            total. Cuánto depende tu ingreso de una sola fuente.
          </p>
          <p className="text-neutral-500">
            Se muestran por separado: MONEYA no combina estas métricas en un índice único en V1.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Diseño conductual</h2>
        <p className="mt-2 text-sm text-neutral-700">
          MONEYA no se apoya en un solo autor: combina el consenso de la literatura de finanzas conductuales para
          el diagnóstico y las mecánicas, y autores narrativos para el tono.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
          <li>
            <span className="font-medium">Kahneman y Thaler</span> para el diseño de decisiones: el simulador y los
            insights fuerzan a detenerse y calcular antes de decidir (Sistema 2), con mejores por defecto y sin
            restringir opciones.
          </li>
          <li>
            <span className="font-medium">Statman</span> para la base de la comparación social: el dinero cubre
            necesidades utilitarias y expresivas, y el diagnóstico las separa explícitamente.
          </li>
          <li>
            <span className="font-medium">Robin y Dominguez</span> para la mecánica de «horas de tu ingreso»:
            ver un gasto como horas de trabajo revela su costo real.
          </li>
          <li>
            <span className="font-medium">Housel</span> para el tono narrativo de la biblioteca, siempre con
            redacción 100% original de MONEYA, nunca resúmenes de texto protegido.
          </li>
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          Referencias de tono en español hispanohablante: Sofía Macías («Pequeño Cerdo Capitalista»). Fuentes
          prescriptivas (Kiyosaki, Ramsey, Sethi) se usan solo como vocabulario o contraejemplo; nunca como «la
          forma correcta» de manejar dinero.
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Datos LATAM</h2>
        <p className="mt-2 text-sm text-neutral-700">
          4 indicadores fijos (cuenta, ahorro formal, crédito formal, capacidad ante emergencias) para Chile y
          Perú, con la ficha de fuente completa en cada ficha: institución, año, metodología y enlace. La fuente es
          Global Findex 2025 (Banco Mundial), datos de campo 2024 (publicado jul 2025). MONEYA solo publica cifras
          verificadas; lo aún no verificado queda fuera o marcado «en verificación».
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Límites y ética</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
          {reglas.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          La redacción de disclaimers y la revisión legal para Chile (CMF) y Perú (SBS) son pasos previos a
          cualquier lanzamiento público.
        </p>
      </section>
    </div>
  );
}