import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
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
        // Escala cálida basada en variables: se invierte bajo `.dark`
        // (ver globals.css) sin tocar las clases de los componentes.
        neutral: {
          50: 'rgb(var(--n50) / <alpha-value>)',
          100: 'rgb(var(--n100) / <alpha-value>)',
          200: 'rgb(var(--n200) / <alpha-value>)',
          300: 'rgb(var(--n300) / <alpha-value>)',
          400: 'rgb(var(--n400) / <alpha-value>)',
          500: 'rgb(var(--n500) / <alpha-value>)',
          600: 'rgb(var(--n600) / <alpha-value>)',
          700: 'rgb(var(--n700) / <alpha-value>)',
          800: 'rgb(var(--n800) / <alpha-value>)',
          900: 'rgb(var(--n900) / <alpha-value>)',
          950: 'rgb(var(--n950) / <alpha-value>)',
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