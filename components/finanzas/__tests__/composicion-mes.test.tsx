// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ComposicionMes } from '../composicion-mes';

afterEach(cleanup);

describe('ComposicionMes (donut de composición del mes)', () => {
  it('con ingreso completo muestra los cuatro segmentos y sus porcentajes', () => {
    render(<ComposicionMes ingreso={1000} esenciales={400} noEsenciales={300} cuotas={100} />);

    expect(screen.getByText('Gastos esenciales')).toBeDefined();
    expect(screen.getByText('Gastos no esenciales')).toBeDefined();
    expect(screen.getByText('Cuotas de deuda')).toBeDefined();
    expect(screen.getByText('Resto del ingreso')).toBeDefined();
    // 400/1000, 300/1000, 100/1000, 200/1000
    expect(screen.getByText('40%')).toBeDefined();
    expect(screen.getByText('30%')).toBeDefined();
    expect(screen.getByText('10%')).toBeDefined();
    expect(screen.getByText('20%')).toBeDefined();
    expect(screen.queryByText(/superan tu ingreso/i)).toBeNull();
  });

  it('cuando las salidas superan el ingreso excede y oculta el resto', () => {
    render(<ComposicionMes ingreso={500} esenciales={400} noEsenciales={300} cuotas={100} />);

    expect(screen.getByText(/superan tu ingreso en/i)).toBeDefined();
    expect(screen.queryByText('Resto del ingreso')).toBeNull();
    // base = salidas (800): 400 -> 50%, 300 -> 38%, 100 -> 13% (redondeo)
    expect(screen.getByText('50%')).toBeDefined();
    expect(screen.getByText('Salidas del mes')).toBeDefined();
  });

  it('sin datos enseña el mensaje de estado vacío', () => {
    render(<ComposicionMes ingreso={0} esenciales={0} noEsenciales={0} cuotas={0} />);

    expect(screen.getByText(/Agrega tu ingreso y tus gastos/i)).toBeDefined();
    expect(screen.queryByText('Gastos esenciales')).toBeNull();
  });

  it('ignora valores negativos y segmenta solo lo positivo', () => {
    render(<ComposicionMes ingreso={200} esenciales={-50} noEsenciales={100} cuotas={0} />);

    expect(screen.queryByText('Gastos esenciales')).toBeNull();
    expect(screen.getByText('Gastos no esenciales')).toBeDefined();
    expect(screen.getByText('Resto del ingreso')).toBeDefined();
    // base = ingreso 200: 100 -> 50%, 100 -> 50%
    expect(screen.getAllByText('50%')).toHaveLength(2);
  });
});
