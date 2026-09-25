import type { Lesson } from '../lessons';

export const LUCK_RISK_LESSONS: readonly Lesson[] = [
  {
    slug: 'suerte-y-riesgo',
    title: 'Suerte y riesgo: la misma moneda',
    summary:
      'Un mismo resultado puede venir de la habilidad, de la suerte o del riesgo. Aprende a no confundir los tres.',
    topic: 'luck_risk',
    readingMinutes: 4,
    body:
      'Durante años, decidir bien se confundió con acertar el resultado. Si la inversión subió, se asumió que fue buena; si bajó, que fue mala. Pero el resultado de casi cualquier decisión financiera mezcla tres cosas: tu habilidad, tu suerte y el riesgo que tomaste.\n\n' +
      'La suerte importa más de lo que nos gusta admitir. Dos personas pueden tomar la misma decisión y obtener resultados opuestos solo por el momento. Por eso copiar ciegamente a quien le fue bien, sin entender su suerte, es de las apuestas más caras.\n\n' +
      'El riesgo es la otra cara: algunos resultados buenos vienen de decisiones que, repetidas muchas veces, terminan mal. Una apuesta a una sola carta puede salir bien una vez y arruinarte a la décima.\n\n' +
      'La manera de tratarlos juntos es quitarte la presión del resultado único. En vez de evaluar una decisión por su desenlace, evalúa si, con la misma información y el mismo proceso, la tomarías de nuevo. Esa pregunta separa lo que dependía de ti de lo que dependió del azar. Y en temas de dinero, el proceso repetible vale más que un acierto de suerte.',
  },
  {
    slug: 'proceso-no-resultado',
    title: 'Juzga el proceso, no el resultado',
    summary:
      'Un buen resultado puede esconder una mala decisión y viceversa. Por eso te conviene fijarte en el proceso.',
    topic: 'luck_risk',
    readingMinutes: 4,
    body:
      'Existe una trampa estadística muy común: mirar solo a los ganadores. El que ganó la lotería, el amigo que apostó y salió bien, la inversión que todos elogian después de subir. Esta mirada olvida a todos los que hicieron lo mismo y perdieron. Se llama sesgo de supervivencia, y en las conversaciones de dinero está por todas partes.\n\n' +
      'La mayoría de las historias de éxito financiero que se cuentan son historias de una carta que salió bien. Copiarlas es asumir que la próxima saque la misma carta.\n\n' +
      'Qué hacer: juzgar decisiones por su proceso, no por su resultado. Antes de tomar una decisión financiera, define de antemano a qué le sirve. ¿Qué información uso? ¿Cuánto puedo perder sin que se caiga mi margen? ¿Lo repetiría cien veces? Si el proceso es sólido, un mal resultado es ruido del azar. Si el proceso es una apuesta, un buen resultado sigue siendo una apuesta.\n\n' +
      'La ventaja práctica es enorme: el proceso lo controlas, el resultado no. Y tu salud financiera, a diferencia de la lotería, se juega en muchos turnos, no en uno.',
  },
];