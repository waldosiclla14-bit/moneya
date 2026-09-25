export { createClientClient } from './client';
export { createServerClient } from './server';
export { supabaseEnvConfigured } from './config';
export type * from './db-types';
export { guardarSimulacion, listarSimulaciones, eliminarSimulacion } from './simulation-repo';
export type { SimulationDecoded, SimulationParams, GuardarSimulacionInput } from './simulation-repo';
export { guardarBienestar, ultimoBienestar } from './wellbeing-repo';
export type { WellbeingDecoded, GuardarWellbeingInput } from './wellbeing-repo';
export { listarLecciones, decodificarLeccion } from './lessons-repo';
export type { LessonDecoded } from './lessons-repo';
export {
  guardarSnapshotFinanciero,
  listarSnapshots,
  guardarDeuda,
  listarDeudas,
} from './finanzas-repo';
export type { SnapshotDecoded, DeudaDecoded, GuardarSnapshotInput } from './finanzas-repo';
export { listarIndicadoresLatam, decodificarIndicador } from './datos-repo';
export type { IndicadorDecoded } from './datos-repo';
export { listarMisiones, decodificarMision } from './misiones-repo';
export {
  listarMisionesConId,
  listarProgresoMisiones,
  guardarProgresoMision,
  resetearProgresoMisiones,
} from './misiones-progress-repo';
export type { ProgresoMision, MissionIdBySlug } from './misiones-progress-repo';
export { guardarPerfil, decodificarPerfil } from './onboarding-repo';
export type { PerfilInput, PerfilDecoded } from './onboarding-repo';
export { registrarEvento } from './events-repo';
export type { EventName } from './events-repo';
export { exportarDatosUsuario, eliminarDatosUsuario } from './datos-usuario-repo';