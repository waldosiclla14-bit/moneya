import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['{lib,components}/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});