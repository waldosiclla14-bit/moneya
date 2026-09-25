import type { MargenFinanciero } from './margenFinanciero';
import { round2 } from './money';

// Umbrales de orientación de MONEYA. Son heurísticas de producto (no normas
// oficiales) y se muestran como texto en la UI para que quien los vea sepa
// qué criterio los dispara.
export const COBERTURA_ATENCION_MESES = 3;
export const COBERTURA_SOLIDA_MESES = 6;
export const DEUDA_REVISAR_RATIO = 0.25;
export const DEUDA_ATENCION_RATIO = 0.4;
export const CONCENTRACION_ATENCION = 0.6;

export type ClaveAtencion = 'cobertura' | 'deuda' | 'concentracion';
export type NivelAtencion = 'atencion' | 'ok';

export interface Atencion {
  clave: ClaveAtencion;
  nivel: NivelAtencion;
  titulo: string;
  detalle: string;
  formula: string;
}

export interface PanoramaDecisional {
  atenciones: Atencion[];
  hayAtencion: boolean;
  paso: string | null;
}

function valorPorcentaje(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function analizarAtenciones(margen: MargenFinanciero): PanoramaDecisional {
  const atenciones: Atencion[] = [];

  const cobertura = margen.mesesCobertura.value;
  if (cobertura !== null) {
    const formula = 'Colchón < 3 meses → atención · ≥ 3 meses base estándar';
    if (cobertura < COBERTURA_ATENCION_MESES) {
      atenciones.push({
        clave: 'cobertura',
        nivel: 'atencion',
        titulo: 'Colchón corto',
        detalle:
          'Tu saldo líquido cubre menos de 3 meses de gastos esenciales. Es lo habitual al empezar: el punto de partida estándar es 3 meses y luego 6.',
        formula,
      });
    } else if (cobertura < COBERTURA_SOLIDA_MESES) {
      atenciones.push({
        clave: 'cobertura',
        nivel: 'ok',
        titulo: 'Colchón base alcanzado',
        detalle: `Tu saldo líquido cubre ${cobertura} meses de gastos esenciales: más de 3, el punto de partida estándar. El siguiente nivel natural es 6 meses.`,
        formula,
      });
    } else {
      atenciones.push({
        clave: 'cobertura',
        nivel: 'ok',
        titulo: 'Colchón sólido',
        detalle: `Tu saldo líquido cubre ${cobertura} meses de gastos esenciales: por encima de la meta de 6 meses.`,
        formula,
      });
    }
  }

  const deuda = margen.ratioDeuda.value;
  if (deuda !== null) {
    const formula = `Cuotas de deuda ÷ ingreso < ${valorPorcentaje(DEUDA_REVISAR_RATIO)} → ok · ≥ ${valorPorcentaje(DEUDA_ATENCION_RATIO)} → atención`;
    if (deuda >= DEUDA_ATENCION_RATIO) {
      atenciones.push({
        clave: 'deuda',
        nivel: 'atencion',
        titulo: 'Deuda con peso alto',
        detalle: `${valorPorcentaje(deuda)} de tu ingreso mensual se va en cuotas. No es un juicio: solo indica que queda poco margen frente a imprevistos.`,
        formula,
      });
    } else if (deuda >= DEUDA_REVISAR_RATIO) {
      atenciones.push({
        clave: 'deuda',
        nivel: 'ok',
        titulo: 'Deuda en margen',
        detalle: `${valorPorcentaje(deuda)} de tu ingreso se destina a cuotas: dentro de un margen cómodo y por debajo del umbral de atención (${valorPorcentaje(DEUDA_ATENCION_RATIO)}).`,
        formula,
      });
    } else {
      atenciones.push({
        clave: 'deuda',
        nivel: 'ok',
        titulo: 'Deuda baja',
        detalle: `Menos de ${valorPorcentaje(DEUDA_REVISAR_RATIO)} de tu ingreso se destina a cuotas: margen amplio.`,
        formula,
      });
    }
  }

  const concentracion = margen.concentracionIngreso.value;
  if (concentracion !== null) {
    const formula = `Fuente principal ÷ ingreso total ≥ ${valorPorcentaje(CONCENTRACION_ATENCION)} → atención`;
    if (concentracion >= CONCENTRACION_ATENCION) {
      atenciones.push({
        clave: 'concentracion',
        nivel: 'atencion',
        titulo: 'Ingreso concentrado',
        detalle: `${valorPorcentaje(concentracion)} de tu ingreso viene de una sola fuente: si esa fuente se detiene, el flujo cambia de golpe.`,
        formula,
      });
    } else {
      atenciones.push({
        clave: 'concentracion',
        nivel: 'ok',
        titulo: 'Ingreso diversificado',
        detalle: `Tu ingreso no depende de una sola fuente (${valorPorcentaje(concentracion)} en la principal): buena protección frente a interrupciones.`,
        formula,
      });
    }
  }

  const conAtencion = atenciones.filter((a) => a.nivel === 'atencion');
  const paso = sugerirPaso(margen, conAtencion);

  return { atenciones, hayAtencion: conAtencion.length > 0, paso };
}

function sugerirPaso(margen: MargenFinanciero, conAtencion: Atencion[]): string | null {
  const prioridad: ClaveAtencion[] = ['cobertura', 'deuda', 'concentracion'];
  const activa = prioridad.find((clave) => conAtencion.some((a) => a.clave === clave));

  if (activa === 'cobertura') {
    const meta = round2(margen.gastosEsenciales * COBERTURA_ATENCION_MESES);
    return `Define cuánto necesitas para cubrir ${COBERTURA_ATENCION_MESES} meses de gastos esenciales (hoy: $${meta.toLocaleString('es-CL')}). Ese número es tu meta de colchón.`;
  }
  if (activa === 'deuda') {
    return 'Revisa la cuota con mayor tasa anual y compara un plan de pago. No hace falta pagarlo todo: un plan claro reduce la sensación de urgencia.';
  }
  if (activa === 'concentracion') {
    return 'Mapea si puedes sumar una segunda fuente de ingreso este trimestre. Un pequeño ingreso extra suele bastar para empezar a diversificar.';
  }
  return 'No hay señales que requieran acción este mes: registra tus gastos durante 7 días para afinar la foto.';
}