import type { Lesson } from '../lessons';

export const ROOM_FOR_ERROR_LESSONS: readonly Lesson[] = [
  {
    slug: 'que-es-margen-de-error',
    title: 'Qué es el margen de error',
    summary:
      'El margen de error no es cuánto ganas, sino cuánto te sobra entre lo que entra y lo que sale cada mes. Es el espacio que te permite equivocarte sin caer.',
    topic: 'room_for_error',
    readingMinutes: 3,
    body:
      'Una de las diferencias más grandes en las finanzas personales no está en el sueldo, sino en el espacio entre lo que entra y lo que sale cada mes. Ese espacio es tu margen de error: la capacidad de absorber un golpe sin que se te caiga la vida.\n\n' +
      'Si se descompone el refrigerador, si el colegio cobra un permiso, si un mes sale más caro, qué pasa. Para la persona sin margen, cualquier imprevisto se convierte en deuda. Para la que tiene margen, es un ajuste incómodo y nada más.\n\n' +
      'En MONEYA medimos una parte de ese margen con los meses de cobertura: cuántos meses podrías sostener tus gastos esenciales con lo que tienes líquido, si tu ingreso desapareciera. Es una cifra simple, con fórmula visible, y no necesita que ganes más para mejorar: puedes bajar gastos, aumentar lo que guardas o las dos cosas.\n\n' +
      'El margen no es un capricho de conservador. Es la diferencia entre decidir con calma y decidir con miedo. Y se construye poco a poco: se trata de que cada mes te sobre algo, por pequeño que sea.',
  },
  {
    slug: 'margen-para-imprevistos',
    title: 'El colchón no es un lujo, es margen',
    summary:
      'Piensa el ahorro de emergencia no como un producto financiero, sino como el espacio que protege tus decisiones de los sobresaltos.',
    topic: 'room_for_error',
    readingMinutes: 3,
    body:
      'La palabra colchón suena a lujo o a excepción. En realidad es la parte más práctica de tus finanzas: dinero líquido al que puedes llegar sin vender nada, sin pedir crédito y sin esperar.\n\n' +
      'La regla mental simple es definir cuántos meses de gastos esenciales quieres tener disponibles. Ese número no es una meta mágica: es un espacio de decisión. Con cero meses, cualquier imprevisto te obliga a elegir entre deuda cara o dejar de pagar otras cosas. Con un mes, ganas aire. Con tres, la mayoría de los imprevistos del día a día dejan de ser una crisis. En tu app puedes ver tu propio número con los meses de cobertura, en lugar de perseguir un porcentaje inventado.\n\n' +
      'Parte del valor del colchón no se nota hasta que lo necesitas: no rinde intereses, no se ve en las redes y nadie te felicita. Pero hace que el resto de tus decisiones financieras sean menos urgentes y mejores.\n\n' +
      'Empieza por cualquier monto. Lo importante es que el flujo mensual sobre, y que lo que sobre no se confunda con un extra para gastar en el primer impulso.',
  },
];