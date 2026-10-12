// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  guardarSnapshotFinanciero: vi.fn(),
  guardarDeuda: vi.fn(),
  createClientClient: vi.fn(() => ({})),
  user: { id: "user-1" },
}));

vi.mock("../../../lib/supabase/use-session", () => ({
  useSession: () => ({ user: mocks.user, ready: true }),
}));
vi.mock("../../../lib/supabase/client", () => ({
  createClientClient: () => mocks.createClientClient(),
}));
vi.mock("../../../lib/supabase/finanzas-repo", () => ({
  guardarSnapshotFinanciero: (...args: unknown[]) => mocks.guardarSnapshotFinanciero(...args),
  guardarDeuda: (...args: unknown[]) => mocks.guardarDeuda(...args),
}));

import { FotoFinanciera } from "../foto-financiera";

beforeEach(() => {
  mocks.guardarSnapshotFinanciero.mockResolvedValue(undefined);
  mocks.guardarDeuda.mockResolvedValue(undefined);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FotoFinanciera (paso finanzas)", () => {
  it("renderiza las secciones y el panorama con los datos de ejemplo", () => {
    render(<FotoFinanciera />);

    expect(screen.getByText("Snapshot del mes")).toBeDefined();
    expect(screen.getByText("Deudas")).toBeDefined();
    expect(screen.getByText("Panorama del mes")).toBeDefined();
    expect(screen.getByText("Ingreso total")).toBeDefined();
    expect(screen.getByText("Flujo del mes (sobra)")).toBeDefined();
    expect(screen.getByText("Sin deudas registradas: el ratio de deuda quedará en 0.")).toBeDefined();
    expect(screen.getByText("Ingreso total").parentElement?.textContent).toContain("1.000.000");
    expect(screen.getByText("Base estándar")).toBeDefined();
  });

  it("recalcula el ratio de deuda al agregar una cuota", () => {
    render(<FotoFinanciera />);

    fireEvent.click(screen.getByRole("button", { name: "+ Agregar deuda" }));
    fireEvent.change(screen.getByLabelText("Cuota mensual"), { target: { value: "400000" } });

    expect(screen.getByText("40%")).toBeDefined();
  });

  it("guarda el snapshot y las deudas con nombre al pulsar Guardar mes", async () => {
    render(<FotoFinanciera />);

    fireEvent.click(screen.getByRole("button", { name: "+ Agregar deuda" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Tarjeta" } });
    fireEvent.change(screen.getByLabelText("Cuota mensual"), { target: { value: "400000" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar mes" }));

    await screen.findByText("Guardado");
    expect(mocks.guardarSnapshotFinanciero).toHaveBeenCalledTimes(1);
    expect(mocks.guardarSnapshotFinanciero).toHaveBeenCalledWith(
      {},
      "user-1",
      expect.objectContaining({ snapshotMonth: "2026-09" }),
    );
    expect(mocks.guardarDeuda).toHaveBeenCalledTimes(1);
    expect(mocks.guardarDeuda).toHaveBeenCalledWith(
      {},
      "user-1",
      expect.objectContaining({ nombre: "Tarjeta", cuotaMensual: 400000 }),
    );
  });
});
