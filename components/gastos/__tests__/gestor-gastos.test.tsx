// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GestorGastos } from "../gestor-gastos";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe("GestorGastos (gestor de gastos local)", () => {
  it("estado vacío enseña a agregar el primer gasto", async () => {
    render(<GestorGastos />);

    expect(await screen.findByText(/Sin gastos en este mes/i)).toBeDefined();
  });

  it("agrega un gasto y actualiza total y lista", async () => {
    render(<GestorGastos />);

    fireEvent.change(await screen.findByPlaceholderText("ej. 12500"), { target: { value: "12500" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar gasto" }));

    expect(await screen.findAllByText("12.500")).toHaveLength(3);
    expect(screen.queryByText(/Sin gastos en este mes/i)).toBeNull();
  });

  it("busca por nota y filtra la lista", async () => {
    render(<GestorGastos />);

    fireEvent.change(await screen.findByPlaceholderText("ej. 12500"), { target: { value: "10000" } });
    fireEvent.change(screen.getByPlaceholderText("ej. almuerzo"), { target: { value: "almuerzo" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar gasto" }));

    fireEvent.change(screen.getByPlaceholderText("ej. 12500"), { target: { value: "3000" } });
    fireEvent.change(screen.getByPlaceholderText("ej. almuerzo"), { target: { value: "metro" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar gasto" }));

    expect(await screen.findAllByText("13.000")).toHaveLength(2);

    fireEvent.change(screen.getByPlaceholderText("Buscar por nota…"), { target: { value: "metro" } });
    expect(screen.getByText(/metro/)).toBeDefined();
    expect(screen.queryByText(/almuerzo/)).toBeNull();
  });

  it("persiste en localStorage y elimina un gasto", async () => {
    render(<GestorGastos />);

    fireEvent.change(await screen.findByPlaceholderText("ej. 12500"), { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar gasto" }));
    expect(await screen.findAllByText("5.000")).toHaveLength(3);

    expect(JSON.parse(window.localStorage.getItem("moneya:gastos:v1") ?? "{}").gastos).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    expect(await screen.findByText(/Sin gastos en este mes/i)).toBeDefined();
    expect(JSON.parse(window.localStorage.getItem("moneya:gastos:v1") ?? "{}").gastos).toHaveLength(0);
  });
});
