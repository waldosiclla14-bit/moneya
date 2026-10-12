// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ContextoLatam } from "../contexto-latam";

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(cleanup);

describe("ContextoLatam (politica de datos faltantes: null = no verificado)", () => {
  it("marca como 'En verificación' exactamente los indicadores sin dato oficial", () => {
    render(<ContextoLatam />);

    expect(screen.getAllByText("En verificación")).toHaveLength(4);
  });

  it("muestra solo los valores verificados y no inventa cifras para los nulos", () => {
    render(<ContextoLatam />);

    for (const verificado of ["85.1%", "59.3%", "31.4%", "20.8%"]) {
      expect(screen.getByText(verificado)).toBeDefined();
    }
    expect(screen.queryAllByText(/^0%$/)).toHaveLength(0);
  });

  it("incluye la ficha de fuente con enlace verificable", () => {
    render(<ContextoLatam />);

    expect(screen.getByText("Fuente:")).toBeDefined();
    const enlaces = screen.getAllByRole("link");
    expect(enlaces.length).toBeGreaterThan(0);
    expect(enlaces[0].getAttribute("href")).toMatch(/^https:\/\//);
  });
});
