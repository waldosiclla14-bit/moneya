'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRegion } from '../../lib/formato/region';
import {
  ESTADO_VACIO,
  actualizarPresupuesto,
  agregarCategoria,
  agregarGasto,
  aCSV,
  aJSON,
  eliminarGasto,
  estadoPresupuesto,
  escribirEstado,
  filtrarGastos,
  hoyISO,
  leerEstado,
  mesActual,
  totalesPorCategoria,
  totalGastos,
  type EstadoGastos,
  type EstadoPresupuesto,
} from '../../lib/gastos/modelo';

const TONO_PRESUPUESTO: Record<Exclude<EstadoPresupuesto, null>, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  cerca: 'bg-amber-50 text-amber-700',
  excedido: 'bg-clay/10 text-clayDeep',
};

const ETIQUETA_PRESUPUESTO: Record<Exclude<EstadoPresupuesto, null>, string> = {
  ok: 'Dentro del presupuesto',
  cerca: 'Cerca del límite',
  excedido: 'Presupuesto excedido',
};

function nombreMes(mes: string): string {
  const [anio, m] = mes.split('-').map(Number);
  const fecha = new Date(anio, m - 1, 1);
  const nombre = fecha.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function GestorGastos() {
  const { money } = useRegion();
  const [estado, setEstado] = useState<EstadoGastos | null>(null);
  const [mes, setMes] = useState(mesActual());
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [texto, setTexto] = useState('');
  const [presupuestoAbierto, setPresupuestoAbierto] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [fecha, setFecha] = useState(hoyISO());
  const [monto, setMonto] = useState('');
  const [categoriaId, setCategoriaId] = useState('alimentacion');
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEstado(leerEstado() ?? { ...ESTADO_VACIO, categorias: [...ESTADO_VACIO.categorias] });
  }, []);

  const gastosMes = useMemo(
    () => filtrarGastos(estado?.gastos ?? [], { mes, categoriaId: categoriaFiltro, texto }),
    [estado, mes, categoriaFiltro, texto],
  );

  const totales = useMemo(() => totalesPorCategoria(gastosMes), [gastosMes]);
  const totalMes = useMemo(() => totalGastos(gastosMes), [gastosMes]);
  const maximo = Math.max(1, ...Object.values(totales));

  if (!estado) return null;
  const actual = estado;

  function guardar(next: EstadoGastos) {
    setEstado(next);
    escribirEstado(next);
  }

  function agregar() {
    try {
      guardar(agregarGasto(actual, { fecha, monto: Number(monto), categoriaId, nota }));
      setMonto('');
      setNota('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  function crearCategoria() {
    try {
      const next = agregarCategoria(actual, nuevaCategoria);
      guardar(next);
      setCategoriaId(next.categorias[next.categorias.length - 1].id);
      setNuevaCategoria('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la categoría.');
    }
  }

  function exportar(tipo: 'csv' | 'json') {
    const contenido = tipo === 'csv' ? aCSV(actual, gastosMes) : aJSON(actual, gastosMes);
    const blob = new Blob([contenido], { type: tipo === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneya-gastos-${mes}.${tipo}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Gastos del mes</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Registra cada gasto con su categoría. El total y el presupuesto se actualizan al instante.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const [y, m] = mes.split('-').map(Number);
              setMes(`${y}-${`${m - 1}`.padStart(2, '0')}`);
            }}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            ‹
          </button>
          <span className="min-w-28 text-center text-sm font-medium">{nombreMes(mes)}</span>
          <button
            type="button"
            onClick={() => {
              const [y, m] = mes.split('-').map(Number);
              setMes(`${y}-${`${m + 1}`.padStart(2, '0')}`);
            }}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            ›
          </button>
        </div>
      </div>

      <section className="card p-5">
        <p className="eyebrow">Registrar un gasto</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-neutral-600">Monto</span>
            <input
              type="text"
              inputMode="numeric"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="ej. 12500"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-600">Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-600">Categoría</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
            >
              {estado.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-neutral-600">Nota (opcional)</span>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="ej. almuerzo"
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={agregar} className="btn-primary">
            Agregar gasto
          </button>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nueva categoría…"
              maxLength={24}
              className="w-44 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <button type="button" onClick={crearCategoria} className="link-soft text-sm">
              Crear categoría
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Total del mes</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => exportar('csv')} className="link-soft text-sm">
              Exportar CSV
            </button>
            <button type="button" onClick={() => exportar('json')} className="link-soft text-sm">
              JSON
            </button>
            <button
              type="button"
              onClick={() => setPresupuestoAbierto((v) => !v)}
              className="link-soft text-sm"
            >
              {presupuestoAbierto ? 'Ocultar presupuesto' : 'Presupuesto'}
            </button>
          </div>
        </div>
        <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink">
          {money.format(totalMes)}
        </p>

        <div className="mt-4 space-y-3">
          {estado.categorias.map((c) => {
            const gastado = totales[c.id] ?? 0;
            const estadoP = estadoPresupuesto(gastado, estado.presupuestos[c.id]);
            const ancho = `${Math.round((gastado / maximo) * 100)}%`;
            return (
              <div key={c.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{c.label}</span>
                  <span className="flex items-center gap-2">
                    {estadoP && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${TONO_PRESUPUESTO[estadoP]}`}>
                        {ETIQUETA_PRESUPUESTO[estadoP]}
                      </span>
                    )}
                    <span className="font-medium text-ink">{money.format(gastado)}</span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="barra h-full rounded-full bg-clay/80" style={{ width: ancho }} />
                </div>
                {presupuestoAbierto && (
                  <div className="mt-1 flex items-center gap-2">
                    <label className="text-xs text-neutral-500">Presupuesto mensual:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      defaultValue={estado.presupuestos[c.id] ?? ''}
                      placeholder="sin límite"
                      onBlur={(e) =>
                        guardar(
                          actualizarPresupuesto(actual, c.id, Number(e.target.value.replace(/\D/g, '')) || 0),
                        )
                      }
                      className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <p className="eyebrow">Gastos</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nota…"
            className="min-w-44 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {estado.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {gastosMes.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            Sin gastos en este mes. Agrega el primero arriba y verás tu total al instante.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {gastosMes.map((g) => {
              const cat = estado.categorias.find((c) => c.id === g.categoriaId);
              return (
                <li key={g.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-neutral-800">
                      {g.nota || cat?.label || g.categoriaId}
                      <span className="ml-2 text-neutral-400">{g.fecha}</span>
                    </p>
                    <p className="text-xs text-neutral-500">{cat?.label}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium text-ink">{money.format(g.monto)}</span>
                    <button
                      type="button"
                      onClick={() => guardar(eliminarGasto(actual, g.id))}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:border-red-400"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
