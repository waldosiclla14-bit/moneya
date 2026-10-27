'use client';

import { useEffect, useMemo, useState } from 'react';
import { abrirRepositorioGastos, tzDelDispositivo, type RepositorioGastos } from '../../lib/db/gastos-repo';
import type { CodigoPais } from '../../lib/formato/moneda';
import { useRegion } from '../../lib/formato/region';
import {
  aCSV,
  aJSON,
  estadoPresupuesto,
  filtrarGastos,
  hoyISO,
  mesActual,
  totalesPorCategoria,
  totalGastos,
  type EstadoGastos,
  type EstadoPresupuesto,
} from '../../lib/gastos/modelo';
import { createClientClient } from '../../lib/supabase/client';
import { obtenerPerfil } from '../../lib/supabase/onboarding-repo';

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

/**
 * Traduce los errores de persistencia a un mensaje accionable en español.
 * El caso crítico es QuotaExceededError (kvvfs escribe SQLite en localStorage):
 * sin este mensaje, el usuario vería el texto técnico del navegador en inglés.
 */
export function mensajeDeError(err: unknown, porDefecto: string): string {
  const nombre = typeof err === 'object' && err !== null ? (err as { name?: string }).name : undefined;
  const texto = err instanceof Error ? err.message : '';
  if (nombre === 'QuotaExceededError' || /quota/i.test(texto)) {
    return 'El navegador se quedó sin espacio para guardar. Exporta o elimina datos de MONEYA, o libera espacio, y vuelve a intentar.';
  }
  if (err instanceof Error && err.message) return err.message;
  return porDefecto;
}

/**
 * País con el que se crea el libro (moneda de la base): el del perfil de
 * Supabase si hay sesión, para no migrar con el país por defecto mientras
 * RegionProvider aún carga el perfil. Sin cliente/sesión/perfil (o error de
 * red) se usa el país del contexto.
 */
async function paisParaMigracion(paisDeContexto: CodigoPais): Promise<CodigoPais> {
  const client = createClientClient();
  if (!client) return paisDeContexto;
  try {
    const { data } = await client.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) return paisDeContexto;
    const perfil = await obtenerPerfil(client, userId);
    return perfil?.countryCode ?? paisDeContexto;
  } catch {
    return paisDeContexto;
  }
}

export function GestorGastos() {
  const { money, countryCode } = useRegion();
  const [estado, setEstado] = useState<EstadoGastos | null>(null);
  const [repo, setRepo] = useState<RepositorioGastos | null>(null);
  const [errorPersistencia, setErrorPersistencia] = useState<string | null>(null);
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
    let activo = true;
    void (async () => {
      try {
        const pais = await paisParaMigracion(countryCode);
        if (!activo) return;
        const abierto = await abrirRepositorioGastos({
          pais,
          tz: tzDelDispositivo(),
          ahora: new Date().toISOString(),
        });
        if (!activo) return;
        setRepo(abierto);
        setEstado(abierto.leer());
        setErrorPersistencia(null);
      } catch (err) {
        if (activo) {
          setErrorPersistencia(mensajeDeError(err, 'No se pudo abrir el almacenamiento del navegador.'));
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [countryCode]);

  const gastosMes = useMemo(
    () => filtrarGastos(estado?.gastos ?? [], { mes, categoriaId: categoriaFiltro, texto }),
    [estado, mes, categoriaFiltro, texto],
  );

  const totales = useMemo(() => totalesPorCategoria(gastosMes), [gastosMes]);
  const totalMes = useMemo(() => totalGastos(gastosMes), [gastosMes]);
  const maximo = Math.max(1, ...Object.values(totales));

  if (!estado) {
    if (errorPersistencia) {
      return (
        <section className="card p-5">
          <p className="eyebrow">Gastos</p>
          <p role="alert" className="mt-2 text-sm text-red-600">{errorPersistencia}</p>
        </section>
      );
    }
    return null;
  }
  const actual = estado;

  /** Ejecuta una operación del repositorio y refresca el estado; null si falla. */
  function accion(mensaje: string, operacion: (r: RepositorioGastos) => EstadoGastos): EstadoGastos | null {
    if (!repo) return null;
    try {
      const siguiente = operacion(repo);
      setEstado(siguiente);
      setError(null);
      return siguiente;
    } catch (err) {
      setError(mensajeDeError(err, mensaje));
      return null;
    }
  }

  function agregar() {
    if (accion('No se pudo guardar.', (r) => r.guardarGasto({ fecha, monto: Number(monto), categoriaId, nota }))) {
      setMonto('');
      setNota('');
    }
  }

  function crearCategoria() {
    const siguiente = accion('No se pudo crear la categoría.', (r) => r.crearCategoria(nuevaCategoria));
    if (siguiente) {
      setCategoriaId(siguiente.categorias[siguiente.categorias.length - 1].id);
      setNuevaCategoria('');
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
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">Gastos del mes</h2>
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
            className="rounded-lg border border-neutral-500 px-3 py-1.5 text-sm"
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
            className="rounded-lg border border-neutral-500 px-3 py-1.5 text-sm"
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
              className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-600">Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-600">Categoría</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
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
              className="mt-1 w-full rounded-lg border border-neutral-500 px-3 py-2"
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
              aria-label="Nombre de la nueva categoría"
              maxLength={24}
              className="w-44 rounded-lg border border-neutral-500 px-3 py-2 text-sm"
            />
            <button type="button" onClick={crearCategoria} className="link-soft text-sm">
              Crear categoría
            </button>
          </div>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
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
                      aria-label={`Presupuesto mensual de ${c.label}`}
                      onBlur={(e) =>
                        accion('No se pudo guardar el presupuesto.', (r) =>
                          r.definirPresupuesto(c.id, Number(e.target.value.replace(/\D/g, '')) || 0),
                        )
                      }
                      className="w-28 rounded-md border border-neutral-500 px-2 py-1 text-xs"
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
            aria-label="Buscar gastos por nota"
            className="min-w-44 flex-1 rounded-lg border border-neutral-500 px-3 py-2 text-sm"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            aria-label="Filtrar gastos por categoría"
            className="rounded-lg border border-neutral-500 px-3 py-2 text-sm"
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
                      onClick={() => accion('No se pudo quitar el gasto.', (r) => r.quitarGasto(g.id))}
                      className="rounded-md border border-red-500 px-2 py-1 text-xs text-red-600 hover:border-red-600"
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
