import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        hairline: 'rgb(var(--hairline) / <alpha-value>)',
        clay: 'rgb(var(--clay) / <alpha-value>)',
        clayDeep: 'rgb(var(--clay-deep) / <alpha-value>)',
        neutral: {
          50: '#FAF9F5',
          100: '#F2F0EB',
          200: '#E8E4DC',
          300: '#CDC6B8',
          400: '#A49C8C',
          500: '#7E776B',
          600: '#6B665E',
          700: '#53504A',
          800: '#3B3934',
          900: '#2E2C29',
          950: '#1F1E1D',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;