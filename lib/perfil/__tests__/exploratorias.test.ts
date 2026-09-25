import { describe, it, expect } from 'vitest';
import { PREGUNTAS_EXPLORATORIAS, respuestaExploratoria } from '../index';

describe('preguntas conductuales exploratorias', () => {
  it('son 10 preguntas con claves únicas', () => {
    expect(PREGUNTAS_EXPLORATORIAS).toHaveLength(10);
    expect(new Set(PREGUNTAS_EXPLORATORIAS.map((p) => p.key)).size).toBe(10);
  });

  it('cada pregunta tiene enunciado claro y 5 opciones ordenadas', () => {
    for (const p of PREGUNTAS_EXPLORATORIAS) {
      expect(p.question.length).toBeGreaterThan(30);
      expect(p.options).toHaveLength(5);
      expect(p.options.map((o) => o.value)).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('usa la misma escala Likert compartida', () => {
    for (const p of PREGUNTAS_EXPLORATORIAS) {
      expect(p.options).toEqual(respuestaExploratoria);
    }
  });

  it('son declarativas y sin lenguaje de culpa ni amenaza (regla 6)', () => {
    const prohibidas = ['no te alcanza', 'estás gastando de más', 'irresponsable', 'deberías'];
    for (const p of PREGUNTAS_EXPLORATORIAS) {
      const lower = p.question.toLowerCase();
      for (const word of prohibidas) {
        expect(lower).not.toContain(word);
      }
    }
  });

  it('no produce ningún score: son exploratorias, no validadas', () => {
    const primitivas = ['score', 'calcular', 'puntaje'];
    for (const p of PREGUNTAS_EXPLORATORIAS) {
      const lower = p.question.toLowerCase();
      for (const word of primitivas) {
        expect(lower).not.toContain(word);
      }
    }
  });
});