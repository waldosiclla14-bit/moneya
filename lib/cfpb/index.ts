export { CFPB_ITEMS, ITEM_BY_KEY, optionsDe, blockLabel, AGE_BUCKET_LABELS } from './items';
export type { CFPBItem, ResponseOption, ItemBlock, AgeBucket } from './items';
export {
  calcularWellbeing,
  scoreCFPB,
  totalDeRespuestas,
  codificarItem,
  desgloseDimensiones,
  validarRespuestas,
  respuestasCompletas,
  NOTE_RESULTADO,
} from './scoring';
export type { RespuestaItem, ResultadoWellbeing, DimensionBreakdown } from './scoring';