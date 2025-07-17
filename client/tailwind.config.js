/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'puntus': {
          'primary': 'rgb(var(--color-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--color-tertiary) / <alpha-value>)',
          'dark': 'rgb(var(--color-dark) / <alpha-value>)',
          'black': 'rgb(var(--color-black) / <alpha-value>)',
        },
        'background': {
          'primary': 'rgb(var(--bg-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',
        },
        'text': {
          'primary': 'rgb(var(--text-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'puntus-gradient': 'linear-gradient(135deg, rgb(var(--color-secondary)), rgb(var(--color-dark)))',
      },
    },
  },
  plugins: [],
}