import { describe, it, expect } from 'vitest';
import { LESSONS, LESSON_TOPIC_LABELS, type LessonTopic } from '../index';

const TOPICS = Object.keys(LESSON_TOPIC_LABELS) as LessonTopic[];

describe('biblioteca de lecciones', () => {
  it('contiene 10 lecciones publicables (PRD: 8–10 artículos)', () => {
    expect(LESSONS).toHaveLength(10);
  });

  it('cubre los 5 temas con 2 lecciones cada uno', () => {
    for (const topic of TOPICS) {
      const count = LESSONS.filter((l) => l.topic === topic).length;
      expect(count, `tema ${topic} debe tener 2 lecciones`).toBe(2);
    }
  });

  it('slugs y títulos únicos', () => {
    const slugs = LESSONS.map((l) => l.slug);
    const titles = LESSONS.map((l) => l.title);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('cada lección tiene resumen, cuerpo, tiempo de lectura y 2+ párrafos', () => {
    for (const l of LESSONS) {
      expect(l.summary.trim().length).toBeGreaterThan(20);
      expect(l.readingMinutes).toBeGreaterThan(0);
      const paragraphs = l.body.split('\n\n').filter((p) => p.trim().length > 0);
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(l.body.split(/\s+/).length).toBeGreaterThan(120);
    }
  });

  it('redacción propia: no reproduce citas literales de terceros', () => {
    const textoCompleto = LESSONS.map((l) => l.body).join('\n');
    const sinComillas = textoCompleto.split('"').length - 1;
    const sinComillasSimples = textoCompleto.split("'").length - 1;
    expect(sinComillas).toBe(0);
    expect(sinComillasSimples).toBe(0);
  });
});