'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createClientClient } from '../supabase/client';
import { obtenerPerfil } from '../supabase/onboarding-repo';
import {
  crearFormateadorMoneda,
  crearFormateadorNumero,
  PAIS_DEFAULT,
  type CodigoPais,
} from './moneda';

export interface RegionContexto {
  countryCode: CodigoPais;
  money: Intl.NumberFormat;
  numero: (valor: number, opciones?: Intl.NumberFormatOptions) => string;
}

const REGION_DEFAULT: RegionContexto = {
  countryCode: PAIS_DEFAULT,
  money: crearFormateadorMoneda(PAIS_DEFAULT),
  numero: (valor, opciones) => crearFormateadorNumero(PAIS_DEFAULT, opciones).format(valor),
};

const Contexto = createContext<RegionContexto | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<CodigoPais>(PAIS_DEFAULT);

  useEffect(() => {
    const client = createClientClient();
    if (!client) return;
    let activo = true;

    const cargar = async (userId: string | null) => {
      if (!userId) {
        if (activo) setCountryCode(PAIS_DEFAULT);
        return;
      }
      try {
        const perfil = await obtenerPerfil(client, userId);
        if (activo && perfil) setCountryCode(perfil.countryCode);
      } catch {
        // Sin perfil legible se mantiene el país por defecto.
      }
    };

    void client.auth.getSession().then(({ data }) => cargar(data.session?.user?.id ?? null));

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      void cargar(session?.user?.id ?? null);
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<RegionContexto>(
    () => ({
      countryCode,
      money: crearFormateadorMoneda(countryCode),
      numero: (v, opciones) => crearFormateadorNumero(countryCode, opciones).format(v),
    }),
    [countryCode],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useRegion(): RegionContexto {
  return useContext(Contexto) ?? REGION_DEFAULT;
}
