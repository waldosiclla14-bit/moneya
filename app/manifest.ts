import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MONEYA — Bienestar financiero',
    short_name: 'MONEYA',
    description:
      'Entiende tus decisiones de dinero, no solo cuánto gastas. Diagnóstico conductual y simulación de escenarios.',
    start_url: `${base}/`,
    display: 'standalone',
    background_color: '#FAF9F5',
    theme_color: '#1F1E1D',
    lang: 'es',
    icons: [{ src: `${base}/icon.svg`, sizes: 'any', type: 'image/svg+xml' }],
  };
}