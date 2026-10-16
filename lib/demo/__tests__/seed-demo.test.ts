// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cargarDemo, limpiarDemo, DEMO_FOTO, DEMO_MISIONES } from "../seed-demo";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("cargarDemo (semilla para probar el flujo)", () => {
  it("escribe foto, misiones y onboarded con los valores esperados", () => {
    cargarDemo();

    const foto = JSON.parse(window.localStorage.getItem("moneya:foto:mes:v1") ?? "null");
    expect(foto.form).toMatchObject({ mes: "2026-09", dependiente: "1000000", liquidez: "1200000" });
    expect(foto.deudas).toHaveLength(1);
    expect(foto.deudas[0]).toMatchObject({ nombre: "Tarjeta", cuotaMensual: 150000 });
    expect(JSON.parse(window.localStorage.getItem("moneya.mission_progress.v1") ?? "null")).toEqual(
      DEMO_MISIONES,
    );
    expect(Object.keys(DEMO_MISIONES)).toHaveLength(5);
    expect(window.localStorage.getItem("moneya.onboarded.v1")).toBe("1");
    expect(DEMO_FOTO.deudas).toHaveLength(1);
  });

  it("sobrescribe sin duplicar (idempotente)", () => {
    cargarDemo();
    cargarDemo();

    expect(JSON.parse(window.localStorage.getItem("moneya:foto:mes:v1") ?? "null").deudas).toHaveLength(1);
  });

  it("limpiarDemo borra las tres claves", () => {
    cargarDemo();
    limpiarDemo();

    expect(window.localStorage.getItem("moneya:foto:mes:v1")).toBeNull();
    expect(window.localStorage.getItem("moneya.mission_progress.v1")).toBeNull();
    expect(window.localStorage.getItem("moneya.onboarded.v1")).toBeNull();
  });
});
