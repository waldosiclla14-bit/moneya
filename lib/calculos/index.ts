export * from './types';
export * from './money';
export { mesesDeCobertura } from './mesesCobertura';
export { ratioDeuda } from './ratioDeuda';
export { concentracionIngreso } from './concentracionIngreso';
export { analizarSnapshot, resumirMetricas } from './margenFinanciero';
export type { MargenFinanciero } from './margenFinanciero';
export {
  analizarAtenciones,
  COBERTURA_ATENCION_MESES,
  COBERTURA_SOLIDA_MESES,
  DEUDA_REVISAR_RATIO,
  DEUDA_ATENCION_RATIO,
  CONCENTRACION_ATENCION,
} from './atenciones';
export type { Atencion, NivelAtencion, PanoramaDecisional } from './atenciones';
export { simularEscenario } from './simulador';
export type { Escenario, SimulationProyeccion } from './simulador';
export { sumaCuotas, sumaSaldos, cuotasDesdeDeudas, DEUDA_TIPO_LABELS } from './deudas';
export type { DeudaInput } from './deudas';
export {
  HORAS_LABORABLES_MES_DEFAULT,
  ingresoPorHora,
  horasDeIngreso,
  equivalenciaHoras,
} from './horasDeIngreso';
export type { EquivalenciaHoras } from './horasDeIngreso';