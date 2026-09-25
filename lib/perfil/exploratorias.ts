export type OpcionExploratoria = { value: number; label: string };

export interface PreguntaExploratoria {
  key: string;
  question: string;
  options: readonly OpcionExploratoria[];
}

export const respuestaExploratoria: readonly OpcionExploratoria[] = [
  { value: 1, label: 'Muy en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Muy de acuerdo' },
];

export const PREGUNTAS_EXPLORATORIAS: readonly PreguntaExploratoria[] = [
  {
    key: 'e01_comparacion',
    question: 'A veces comparo mi situación con la de personas de mi entorno y eso me mueve a gastar.',
    options: respuestaExploratoria,
  },
  {
    key: 'e02_suficiente',
    question: 'Tengo claro cuánto necesito ahorrado para sentirme tranquilo.',
    options: respuestaExploratoria,
  },
  {
    key: 'e03_prestamo_cerco',
    question: 'Cuando alguien cercano me pide dinero, se me hace difícil decir que no.',
    options: respuestaExploratoria,
  },
  {
    key: 'e04_estatus',
    question: 'He comprado algo pensando más en lo que otros pensarán que en lo que necesito.',
    options: respuestaExploratoria,
  },
  {
    key: 'e05_ingreso_variable',
    question: 'Mi ingreso cambia de un mes a otro, y eso me complica planificar.',
    options: respuestaExploratoria,
  },
  {
    key: 'e06_freno_compras',
    question: 'Antes de una compra grande, la dejo pasar unos días aunque me alcance la plata.',
    options: respuestaExploratoria,
  },
  {
    key: 'e07_conversacion',
    question: 'En mi casa hablamos del dinero con honestidad y sin juicios.',
    options: respuestaExploratoria,
  },
  {
    key: 'e08_ahorro_sin_objetivo',
    question: 'Ahorro por si acaso, aunque no tenga claro para qué en concreto.',
    options: respuestaExploratoria,
  },
  {
    key: 'e09_sorpresa_ingreso_extra',
    question: 'Cuando me llega un ingreso extra, lo gasto antes de guardarlo.',
    options: respuestaExploratoria,
  },
  {
    key: 'e10_horizonte',
    question: 'Pensar en mi dinero a largo plazo me produce más claridad que ansiedad.',
    options: respuestaExploratoria,
  },
];