// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ResumenHoy } from "../resumen-hoy";

const KEY = "moneya:foto:mes:v1";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe("ResumenHoy (panel del dashboard)", () => {
  it("sin foto guardada muestra el llamado a armarla", () => {
    render(<ResumenHoy />);

    expect(screen.getByText("Tu foto de hoy")).toBeDefined();
    expect(screen.getByText("Aún no armas tu foto del mes")).toBeDefined();
    const cta = screen.getByRole("link", { name: "Armar mi foto del mes" });
    expect(cta.getAttribute("href")).toBe("/finanzas");
  });

  it("con foto guardada muestra colchón, ratio de deuda y flujo", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        form: {
          mes: "2026-09",
          dependiente: "1000000",
          independiente: "0",
          otros: "0",
          esencial: "300000",
          noEsencial: "200000",
          liquidez: "900000",
        },
        deudas: [{ id: "d1", nombre: "Tarjeta", tipo: "tarjeta", saldo: 500000, cuotaMensual: 250000, tasaAnual: 0 }],
      }),
    );
    render(<ResumenHoy />);

    expect(screen.getByText("Tu foto de hoy · 2026-09")).toBeDefined();
    expect(screen.getByText("3.0")).toBeDefined();
    expect(screen.getByText("25%")).toBeDefined();
    expect(screen.getByText("500.000")).toBeDefined();
    expect(screen.getByRole("link", { name: "Ver detalle →" }).getAttribute("href")).toBe("/finanzas");
  });

  it("con dato ilegible no se rompe y muestra el llamado", () => {
    window.localStorage.setItem(KEY, "{no-json");
    render(<ResumenHoy />);

    expect(screen.getByText("Aún no armas tu foto del mes")).toBeDefined();
  });
});
