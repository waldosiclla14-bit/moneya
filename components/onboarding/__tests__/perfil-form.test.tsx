// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  guardarPerfil: vi.fn(),
  registrarEvento: vi.fn(),
  createClientClient: vi.fn(() => ({})),
  user: { id: "user-1" },
}));

vi.mock("../../../lib/supabase/use-session", () => ({
  useSession: () => ({ user: mocks.user, ready: true }),
}));
vi.mock("../../../lib/supabase/client", () => ({
  createClientClient: () => mocks.createClientClient(),
}));
vi.mock("../../../lib/supabase/onboarding-repo", () => ({
  guardarPerfil: (...args: unknown[]) => mocks.guardarPerfil(...args),
}));
vi.mock("../../../lib/supabase/events-repo", () => ({
  registrarEvento: (...args: unknown[]) => mocks.registrarEvento(...args),
}));

import { PerfilForm } from "../perfil-form";

beforeEach(() => {
  mocks.guardarPerfil.mockResolvedValue(undefined);
  mocks.registrarEvento.mockResolvedValue(undefined);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PerfilForm (guardar perfil con sesión simulada)", () => {
  it("ofrece país, edad y situación laboral y el botón de guardado", () => {
    render(<PerfilForm />);

    expect(screen.getByText("País")).toBeDefined();
    expect(screen.getByText("Edad")).toBeDefined();
    expect(screen.getByText("Situación laboral")).toBeDefined();
    expect(screen.getByRole("button", { name: "Guardar perfil" })).toBeDefined();
  });

  it("guarda los valores por defecto (CL, 18_61, dependiente) y registra los eventos una vez", async () => {
    render(<PerfilForm />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));

    await screen.findByText("Guardado");
    expect(mocks.guardarPerfil).toHaveBeenCalledTimes(1);
    expect(mocks.guardarPerfil).toHaveBeenCalledWith(
      {},
      "user-1",
      { countryCode: "CL", ageBucket: "18_61", employmentStatus: "dependiente" },
    );
    expect(mocks.registrarEvento).toHaveBeenCalledWith({}, "user-1", "onboarding_completed");
    expect(mocks.registrarEvento).toHaveBeenCalledWith({}, "user-1", "profile_saved");
    expect(window.localStorage.getItem("moneya.onboarded.v1")).toBe("1");
  });

  it("envía el país y el tramo de edad elegidos", async () => {
    render(<PerfilForm />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "PE" } });
    fireEvent.change(selects[1], { target: { value: "62_plus" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));

    await screen.findByText("Guardado");
    expect(mocks.guardarPerfil).toHaveBeenCalledWith(
      {},
      "user-1",
      { countryCode: "PE", ageBucket: "62_plus", employmentStatus: "dependiente" },
    );
  });
});
