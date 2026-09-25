import type { Metadata } from 'next';
import { MisionesList } from '../../components/misiones/misiones-list';

export const metadata: Metadata = { title: 'Misiones — MONEYA' };

export default function MisionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Tus 5 misiones</h1>
        <p className="mt-1 text-neutral-600">
          Una ruta corta para armar tu foto financiera y estresarla. Marca tu estado; el progreso se guarda en
          tu navegador (MVP) hasta conectar tu cuenta.
        </p>
      </div>
      <MisionesList />
    </div>
  );
}