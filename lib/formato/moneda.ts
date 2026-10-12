import { PAISES, type PaisInfo } from '../datos';

export type CodigoPais = PaisInfo['code'];

export const PAIS_DEFAULT_INFO: PaisInfo = { code: 'CL', name: 'Chile', currencyCode: 'CLP', locale: 'es-CL' };

export const PAIS_DEFAULT: CodigoPais = PAIS_DEFAULT_INFO.code;

export function paisDe(code?: string | null): PaisInfo {
  return PAISES.find((p) => p.code === code) ?? PAIS_DEFAULT_INFO;
}

export function localeDePais(code?: string | null): string {
  return paisDe(code).locale;
}

export function monedaDePais(code?: string | null): string {
  return paisDe(code).currencyCode;
}

export function crearFormateadorMoneda(code?: string | null): Intl.NumberFormat {
  return new Intl.NumberFormat(localeDePais(code), { maximumFractionDigits: 0 });
}

export function crearFormateadorNumero(
  code?: string | null,
  opciones?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return new Intl.NumberFormat(localeDePais(code), opciones);
}
