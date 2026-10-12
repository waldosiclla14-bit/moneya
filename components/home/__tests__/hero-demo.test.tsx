// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroDemo } from "../hero-demo";
import {
  equivalenciaHoras,
  HORAS_LABORABLES_MES_DEFAULT,
} from "../../../lib/calculos";

afterEach(cleanup);

function mostrarHoras(horas: number): string {
  if (horas <= 0) return "0";
  return horas < 10
    ? horas.toFixed(1)
    : new Intl.NumberFormat("es-CL").format(Math.round(horas));
}

function cajaResultado(): HTMLElement {
  const caja = document.querySelector('[aria-live="polite"]');
  if (!caja) throw new Error("No se encontro la caja de resultado");
  return caja as HTMLElement;
}

describe("HeroDemo", () => {
  it("renderiza el titulo y la equivalencia inicial", () => {
    render(<HeroDemo />);

    expect(
      screen.getByText(/¿Cuánto trabajo es esa compra\?/i),
    ).toBeDefined();

    const esperado = mostrarHoras(
      equivalenciaHoras(35000, 1000000, HORAS_LABORABLES_MES_DEFAULT).horas,
    );
    expect(cajaResultado().textContent).toContain(esperado);
  });

  it("recalcula la equivalencia al cambiar el monto", () => {
    render(<HeroDemo />);

    fireEvent.change(screen.getByLabelText(/Monto de la compra/i), {
      target: { value: "70000" },
    });

    const antes = mostrarHoras(
      equivalenciaHoras(35000, 1000000, HORAS_LABORABLES_MES_DEFAULT).horas,
    );
    const despues = mostrarHoras(
      equivalenciaHoras(70000, 1000000, HORAS_LABORABLES_MES_DEFAULT).horas,
    );

    expect(despues).not.toBe(antes);
    expect(cajaResultado().textContent).toContain(despues);
    expect(cajaResultado().textContent).not.toContain(antes);
  });
});
