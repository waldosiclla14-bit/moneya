import type { Lesson } from '../lessons';

export const NEVER_ENOUGH_LESSONS: readonly Lesson[] = [
  {
    slug: 'que-es-suficiente',
    title: '¿Cuánto es suficiente?',
    summary:
      'Suficiente no es una cifra universal: es una conversación honesta contigo sobre qué te alcanza para vivir bien.',
    topic: 'never_enough',
    readingMinutes: 3,
    body:
      'Todos conocemos la pregunta de cuánto necesito para vivir tranquilo y la sensación de que la respuesta siempre es un poco más. La trampa está en tratar suficiente como una cifra que viene de afuera: el auto del compañero, el viaje del amigo, la vitrina del vecino.\n\n' +
      'Suficiente es una respuesta propia, y se construye en dos pasos. Primero, lo objetivo: cuánto necesitas cada mes para cubrir lo esencial, tus metas y un margen para imprevistos. Ese número puedes verlo con tus métricas en MONEYA, sin opiniones. Segundo, lo subjetivo: qué parte de tu vida estarías dispuesto a no aumentar para conservar libertad.\n\n' +
      'El riesgo no es querer más; es no saber cuándo parar. Cuando suficiente no está definido, el ingreso sube y el estilo de vida sube con él, y la sensación de escasez queda igual. Cuando está definido, cada ingreso extra deja de ser automáticamente un gasto extra y se vuelve una decisión.',
  },
  {
    slug: 'la-escalera-del-mas',
    title: 'La escalera sin techo',
    summary:
      'Por qué es tan difícil sentirse satisfecho y qué ayuda a no caer en el nunca suficiente.',
    topic: 'never_enough',
    readingMinutes: 3,
    body:
      'Hay una dinámica que se repite en casi todas las finanzas: el ingreso sube, las expectativas suben, y al final del mes vuelve a no sobrar nada. No es falta de disciplina: es que la referencia con la que medimos suficiente es móvil.\n\n' +
      'Cuando comparamos nuestro consumo con el del círculo que tenemos cerca, siempre hay alguien con más. Comparar es gratis y rápido, y por eso es la comparación favorita del cerebro. El problema es que rara vez comparamos lo que no se ve: la deuda que sostiene el auto del vecino, las cuotas detrás de la pantalla del bar.\n\n' +
      'Dos cosas ayudan. La primera es compararte con tu historia, no con la de otros: tu punto de partida, tu progreso, tu margen. La segunda es definir lo que suficiente significa para ti con números propios, como tus meses de cobertura o tu meta de ahorro, y dejar que ese número, no el vecino, marque el ritmo.\n\n' +
      'El nunca suficiente no se cura ganando más. Se cura dándole un número a suficiente.',
  },
];