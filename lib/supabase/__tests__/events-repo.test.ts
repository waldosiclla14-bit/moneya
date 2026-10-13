import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { validarPropiedades, registrarEvento, EVENTOS_PERMITIDOS } from "../events-repo";
import type { Database } from "../db-types";

function clienteOk() {
  const insert = vi.fn(async () => ({ error: null }));
  const client = { from: () => ({ insert }) } as unknown as SupabaseClient<Database>;
  return { client, insert };
}

describe("validarPropiedades (privacidad de la telemetria)", () => {
  it("acepta un objeto vacio (caso por defecto)", () => {
    expect(validarPropiedades({})).toEqual({});
  });

  it("acepta solo valores primitivos y los conserva", () => {
    const entrada = { step: "finanzas", ok: true, intentos: 3 };
    expect(validarPropiedades(entrada)).toEqual(entrada);
  });

  it("rechaza claves sensibles o financieras", () => {
    expect(() => validarPropiedades({ monto: 50000 })).toThrow(/no está permitida/);
    expect(() => validarPropiedades({ ingresos_mensuales: 900000 })).toThrow(/no está permitida/);
    expect(() => validarPropiedades({ Email: "a@b.cl" })).toThrow(/no está permitida/);
    expect(() => validarPropiedades({ saldo_deuda: 100 })).toThrow(/no está permitida/);
  });

  it("rechaza estructuras anidadas o null", () => {
    expect(() => validarPropiedades([1, 2])).toThrow(/objeto plano/);
    expect(() => validarPropiedades({ meta: { paso: 1 } })).toThrow(/texto, número o booleano/);
    expect(() => validarPropiedades({ meta: null })).toThrow(/texto, número o booleano/);
  });

  it("rechaza numeros no finitos y textos largos", () => {
    expect(() => validarPropiedades({ ratio: Number.NaN })).toThrow(/número finito/);
    expect(() => validarPropiedades({ ratio: Number.POSITIVE_INFINITY })).toThrow(/número finito/);
    expect(() => validarPropiedades({ nota: "x".repeat(65) })).toThrow(/64 caracteres/);
  });

  it("rechaza demasiadas claves", () => {
    const muchas: Record<string, number> = {};
    for (let i = 0; i < 11; i += 1) muchas["campo_" + i] = i;
    expect(() => validarPropiedades(muchas)).toThrow(/máximo de 10/);
  });
});

describe("EVENTOS_PERMITIDOS (set fijo de telemetría, PRD V2 §18)", () => {
  it("son exactamente los 5 eventos del enum public.event_name", () => {
    expect([...EVENTOS_PERMITIDOS].sort()).toEqual(
      ["mission_completed", "onboarding_completed", "profile_saved", "simulation_created", "test_completed"],
    );
  });

  it("registrarEvento acepta un evento permitido sin properties financieras", async () => {
    const { client, insert } = clienteOk();

    await registrarEvento(client, "u1", "test_completed");

    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({ user_id: "u1", event_name: "test_completed", properties: {} });
  });

  it("registrarEvento rechaza un nombre fuera del set antes de tocar la DB", async () => {
    const { client, insert } = clienteOk();

    await expect(registrarEvento(client, "u1", "pantalla_vista" as never)).rejects.toThrow(/no permitido/);
    expect(insert).not.toHaveBeenCalled();
  });
});

