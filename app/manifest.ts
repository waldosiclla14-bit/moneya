import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MONEYA — Bienestar financiero',
    short_name: 'MONEYA',
    description: 'Entiende tus decisiones de dinero, no solo cuánto gastas.',
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#FAF9F5',
    theme_color: '#1F1E1D',
    icons: [
      { src: `${BASE_PATH}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${BASE_PATH}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${BASE_PATH}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}