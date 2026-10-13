// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RequireAuth } from "../require-auth";

const mocks = vi.hoisted(() => ({
  session: { user: null as null | { id: string }, ready: false },
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("../../../lib/supabase/use-session", () => ({
  useSession: () => mocks.session,
}));

beforeEach(() => {
  mocks.session = { user: null, ready: false };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RequireAuth (gateo client-side, J1)", () => {
  it("mientras la sesión no está lista muestra espera sin redirigir", () => {
    render(
      <RequireAuth>
        <span>Contenido protegido</span>
      </RequireAuth>,
    );

    expect(screen.getByText(/Comprobando tu sesión/i)).toBeDefined();
    expect(screen.queryByText("Contenido protegido")).toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("sin usuario redirige a /login sin mostrar el contenido", () => {
    mocks.session = { user: null, ready: true };
    render(
      <RequireAuth>
        <span>Contenido protegido</span>
      </RequireAuth>,
    );

    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Contenido protegido")).toBeNull();
  });

  it("con usuario muestra el contenido sin redirigir", () => {
    mocks.session = { user: { id: "user-1" }, ready: true };
    render(
      <RequireAuth>
        <span>Contenido protegido</span>
      </RequireAuth>,
    );

    expect(screen.getByText("Contenido protegido")).toBeDefined();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
