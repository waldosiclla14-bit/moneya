// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "../theme-toggle";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(cleanup);

describe("ThemeToggle (modo oscuro con clase)", () => {
  it("empieza en claro sin preferencia guardada", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeDefined();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("alterna a oscuro, lo persiste y actualiza el estado accesible", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo oscuro" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("moneya:tema")).toBe("oscuro");
    const boton = screen.getByRole("button", { name: "Cambiar a modo claro" });
    expect(boton.getAttribute("aria-pressed")).toBe("true");
  });

  it("restaura el tema guardado al montar", () => {
    window.localStorage.setItem("moneya:tema", "oscuro");
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: "Cambiar a modo claro" })).toBeDefined();
  });
});
