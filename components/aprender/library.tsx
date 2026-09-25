'use client';

import { useState } from 'react';
import { LESSONS, LESSON_TOPIC_LABELS, type LessonTopic } from '../../lib/aprender';
import type { Lesson } from '../../lib/aprender';

const ALL: LessonTopic | 'todos' = 'todos';

export function Library() {
  const [topic, setTopic] = useState<LessonTopic | 'todos'>(ALL);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const visible = topic === ALL ? LESSONS : LESSONS.filter((l) => l.topic === topic);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Chip active={topic === ALL} onClick={() => setTopic(ALL)}>
          Todos
        </Chip>
        {(Object.keys(LESSON_TOPIC_LABELS) as LessonTopic[]).map((t) => (
          <Chip key={t} active={topic === t} onClick={() => setTopic(t)}>
            {LESSON_TOPIC_LABELS[t]}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((lesson) => {
          const open = openSlug === lesson.slug;
          return (
            <article key={lesson.slug} className="card">
              <button
                type="button"
                onClick={() => setOpenSlug(open ? null : lesson.slug)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display font-semibold text-neutral-900">{lesson.title}</h3>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {lesson.readingMinutes} min · {LESSON_TOPIC_LABELS[lesson.topic]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">{lesson.summary}</p>
              </button>
              {open && (
                <div className="border-t border-neutral-100 px-5 pb-5">
                  {lesson.body
                    .split('\n\n')
                    .filter((p) => p.trim().length > 0)
                    .map((p, i) => (
                      <p key={i} className="mt-3 text-[15px] leading-relaxed text-neutral-800">
                        {p}
                      </p>
                    ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400">
        Biblioteca original MONEYA: 10 artículos propios inspirados en ideas clásicas de finanzas
        personales (los 5 ejes del PRD). Misma fuente que el seed de la base de datos (migración 0003).
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500'
      }`}
    >
      {children}
    </button>
  );
}