import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://waldosiclla14-bit.github.io/moneya';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const CANONICAL = new URL(BASE_PATH || '/', SITE_URL).toString().replace(/\/$/, '');

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const ultima = new Date().toISOString().split('T')[0];
  const rutas = [
    '',
    '/simular',
    '/perfil',
    '/datos',
    '/misiones',
    '/aprender',
    '/metodologia',
    '/finanzas',
    '/onboarding',
    '/login',
  ];
  return rutas.map((r) => ({ url: `${CANONICAL}${r}`, lastModified: ultima }));
}