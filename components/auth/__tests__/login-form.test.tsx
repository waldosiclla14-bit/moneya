// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LoginForm } from "../login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("../../../lib/supabase/config", () => ({
  supabaseEnvConfigured: () => false,
}));

afterEach(cleanup);

describe("LoginForm en modo demo (Supabase sin configurar)", () => {
  it("explica el modo demo en lugar de mostrar el formulario", () => {
    render(<LoginForm />);

    expect(screen.getByText(/Estás en modo demo/i)).toBeDefined();
    expect(screen.getByText(/no se envían a\s+ningún servidor/i)).toBeDefined();
    expect(screen.queryByText("Email")).toBeNull();
    expect(screen.queryByText("Contraseña")).toBeNull();
  });

  it("deja los pasos técnicos en un bloque plegable para el administrador", () => {
    render(<LoginForm />);

    expect(screen.getByText(/Cómo activar el guardado/i)).toBeDefined();
    expect(
      screen.getByText(/supabase\/setup-all-in-one\.sql/),
    ).toBeDefined();
  });

  it("ofrece un enlace para explorar la demo", () => {
    render(<LoginForm />);

    const enlace = screen.getByRole("link", { name: /Explorar la demo/i });
    expect(enlace.getAttribute("href")).toBe("/");
  });
});
