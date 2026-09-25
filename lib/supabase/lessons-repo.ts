import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db-types';
import type { LessonTopic } from '../aprender';

export interface LessonDecoded {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: LessonTopic;
  readingMinutes: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

type LessonRow = Database['public']['Tables']['lessons']['Row'];

export function decodificarLeccion(row: LessonRow): LessonDecoded {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    topic: row.topic,
    readingMinutes: row.reading_minutes,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listarLecciones(client: SupabaseClient<Database>): Promise<LessonDecoded[]> {
  const { data, error } = await client
    .from('lessons')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`No se pudieron listar las lecciones: ${error.message}`);
  return data.map(decodificarLeccion);
}