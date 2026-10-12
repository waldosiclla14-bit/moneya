import { describe, it, expect } from "vitest";
import { validarPropiedades } from "../events-repo";

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

