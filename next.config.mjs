import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Build dual: default (server+SSR, Vercel) ó export estático (GitHub Pages).
  // BUILD_MODE=export → genera ./out; NEXT_PUBLIC_BASE_PATH → subruta (hosting estático).
  output: process.env.BUILD_MODE === 'export' ? 'export' : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: { unoptimized: true },
};

export default nextConfig;