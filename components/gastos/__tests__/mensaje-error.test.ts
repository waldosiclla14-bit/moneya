// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mensajeDeError } from '../gestor-gastos';

describe('mensajeDeError (cuota y errores de persistencia)', () => {
  it('traduce QuotaExceededError a un mensaje accionable en español', () => {
    const err = new DOMException('Setting the value exceeded the quota.', 'QuotaExceededError');

    const mensaje = mensajeDeError(err, 'No se pudo guardar.');

    expect(mensaje).toMatch(/sin espacio/i);
    expect(mensaje).toMatch(/Exporta o elimina datos/i);
    expect(mensaje).not.toMatch(/quota/i);
  });

  it('detecta el error de cuota aunque llegue como Error genérico', () => {
    const mensaje = mensajeDeError(new Error('Quota exceeded'), 'No se pudo guardar.');
    expect(mensaje).toMatch(/sin espacio/i);
  });

  it('traduce SQLITE_IOERR (kvvfs sin espacio) a un mensaje accionable', () => {
    const mensaje = mensajeDeError(
      new Error('SQLITE_IOERR: sqlite3 result code 10: disk I/O error'),
      'No se pudo guardar.',
    );
    expect(mensaje).toMatch(/No se pudo guardar en el navegador/i);
    expect(mensaje).toMatch(/almacenamiento local/i);
    expect(mensaje).not.toMatch(/SQLITE_IOERR|disk I\/O/i);
  });

  it('conserva el mensaje de errores que no son de cuota', () => {
    expect(mensajeDeError(new Error('Base corrupta'), 'No se pudo guardar.')).toBe('Base corrupta');
  });

  it('usa el mensaje por defecto con valores desconocidos', () => {
    expect(mensajeDeError('texto suelto', 'No se pudo guardar.')).toBe('No se pudo guardar.');
    expect(mensajeDeError(null, 'No se pudo guardar.')).toBe('No se pudo guardar.');
  });
});
