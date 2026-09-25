import type { Database } from '../supabase/db-types';
import { ROOM_FOR_ERROR_LESSONS } from './data/room-for-error';
import { NEVER_ENOUGH_LESSONS } from './data/never-enough';
import { STATUS_CONSUMPTION_LESSONS } from './data/status-consumption';
import { INVISIBLE_WEALTH_LESSONS } from './data/invisible-wealth';
import { LUCK_RISK_LESSONS } from './data/luck-risk';

export type LessonTopic = Database['public']['Enums']['lesson_topic'];

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: LessonTopic;
  readingMinutes: number;
}

export const LESSON_TOPIC_LABELS: Record<LessonTopic, string> = {
  room_for_error: 'Margen de error',
  never_enough: 'Suficiente',
  status_consumption: 'Consumo y estatus',
  invisible_wealth: 'Riqueza invisible',
  luck_risk: 'Suerte y riesgo',
};

export const LESSONS: readonly Lesson[] = [
  ...ROOM_FOR_ERROR_LESSONS,
  ...NEVER_ENOUGH_LESSONS,
  ...STATUS_CONSUMPTION_LESSONS,
  ...INVISIBLE_WEALTH_LESSONS,
  ...LUCK_RISK_LESSONS,
];

export const LESSON_BY_SLUG: ReadonlyMap<string, Lesson> = new Map(LESSONS.map((l) => [l.slug, l]));