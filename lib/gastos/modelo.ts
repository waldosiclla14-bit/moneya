export interface Categoria {
  id: string;
  label: string;
}

export interface Gasto {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  categoriaId: string;
  nota: string;
}

export interface EstadoGastos {
  categorias: Categoria[];
  gastos: Gasto[];
  presupuestos: Record<string, number>; // mensual por categoriaId
}

export type Filtro = {
  mes: string; // YYYY-MM, '' = todos
  categoriaId: string; // '' = todas
  texto: string;
};

export type EstadoPresupuesto = 'ok' | 'cerca' | 'excedido' | null;

export const STORAGE_KEY = 'moneya:gastos:v1';

export const CATEGORIAS_BASE: readonly Categoria[] = [
  { id: 'alimentacion', label: 'Alimentación' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'vivienda', label: 'Vivienda' },
  { id: 'salud', label: 'Salud' },
  { id: 'ocio', label: 'Ocio' },
  { id: 'educacion', label: 'Educación' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'otros', label: 'Otros' },
];

export const ESTADO_VACIO: EstadoGastos = {
  categorias: [...CATEGORIAS_BASE],
  gastos: [],
  presupuestos: {},
};

export function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hoyISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const dia = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function mesDe(fecha: string): string {
  return fecha.slice(0, 7);
}

export function mesActual(): string {
  return hoyISO().slice(0, 7);
}

function nuevoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function agregarCategoria(estado: EstadoGastos, label: string): EstadoGastos {
  const limpia = label.trim();
  if (limpia.length < 2) throw new Error('La categoría necesita al menos 2 caracteres.');
  const id = slugify(limpia);
  if (!id) throw new Error('La categoría no es válida.');
  if (estado.categorias.some((c) => c.id === id || c.label.toLowerCase() === limpia.toLowerCase())) {
    throw new Error('Esa categoría ya existe.');
  }
  return { ...estado, categorias: [...estado.categorias, { id, label: limpia }] };
}

export function agregarGasto(
  estado: EstadoGastos,
  input: { fecha: string; monto: number; categoriaId: string; nota?: string },
): EstadoGastos {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fecha)) throw new Error('Fecha inválida.');
  if (!Number.isFinite(input.monto) || input.monto <= 0) throw new Error('El monto debe ser mayor a 0.');
  if (!estado.categorias.some((c) => c.id === input.categoriaId)) {
    throw new Error('Categoría desconocida.');
  }
  const gasto: Gasto = {
    id: nuevoId(),
    fecha: input.fecha,
    monto: Math.round(input.monto * 100) / 100,
    categoriaId: input.categoriaId,
    nota: (input.nota ?? '').trim().slice(0, 80),
  };
  return { ...estado, gastos: [gasto, ...estado.gastos] };
}

export function eliminarGasto(estado: EstadoGastos, id: string): EstadoGastos {
  return { ...estado, gastos: estado.gastos.filter((g) => g.id !== id) };
}

export function actualizarPresupuesto(
  estado: EstadoGastos,
  categoriaId: string,
  monto: number,
): EstadoGastos {
  if (!Number.isFinite(monto) || monto < 0) throw new Error('Presupuesto inválido.');
  const presupuestos = { ...estado.presupuestos };
  if (monto === 0) delete presupuestos[categoriaId];
  else presupuestos[categoriaId] = Math.round(monto * 100) / 100;
  return { ...estado, presupuestos };
}

export function filtrarGastos(gastos: Gasto[], filtro: Filtro): Gasto[] {
  const texto = filtro.texto.trim().toLowerCase();
  return gastos.filter((g) => {
    if (filtro.mes && mesDe(g.fecha) !== filtro.mes) return false;
    if (filtro.categoriaId && g.categoriaId !== filtro.categoriaId) return false;
    if (texto && !g.nota.toLowerCase().includes(texto)) return false;
    return true;
  });
}

export function totalGastos(gastos: Gasto[]): number {
  return Math.round(gastos.reduce((a, g) => a + g.monto, 0) * 100) / 100;
}

export function totalesPorCategoria(gastos: Gasto[]): Record<string, number> {
  const totales: Record<string, number> = {};
  for (const g of gastos) {
    totales[g.categoriaId] = Math.round(((totales[g.categoriaId] ?? 0) + g.monto) * 100) / 100;
  }
  return totales;
}

export function estadoPresupuesto(gastado: number, presupuesto: number | undefined): EstadoPresupuesto {
  if (!presupuesto || presupuesto <= 0) return null;
  if (gastado >= presupuesto) return 'excedido';
  if (gastado >= presupuesto * 0.8) return 'cerca';
  return 'ok';
}

function escaparCsv(v: string): string {
  if (/[";\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function aCSV(estado: EstadoGastos, gastos: Gasto[]): string {
  const lineas = ['fecha;categoria;monto;nota'];
  const ordenados = [...gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  for (const g of ordenados) {
    const cat = estado.categorias.find((c) => c.id === g.categoriaId)?.label ?? g.categoriaId;
    lineas.push([g.fecha, escaparCsv(cat), String(g.monto), escaparCsv(g.nota)].join(';'));
  }
  return lineas.join('\n');
}

export function aJSON(estado: EstadoGastos, gastos: Gasto[]): string {
  const datos = gastos.map((g) => ({
    fecha: g.fecha,
    categoria: estado.categorias.find((c) => c.id === g.categoriaId)?.label ?? g.categoriaId,
    monto: g.monto,
    nota: g.nota,
  }));
  return JSON.stringify(datos, null, 2);
}

export function leerEstado(): EstadoGastos | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EstadoGastos;
    if (!Array.isArray(parsed.gastos) || !Array.isArray(parsed.categorias)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function escribirEstado(estado: EstadoGastos): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    /* almacenamiento no disponible */
  }
}
