import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['Manrope', 'sans-serif'],
        serif:   ['Lora', 'serif'],
      },
      colors: {
        ink:    '#1C1208',
        ink2:   '#3D2B1A',
        muted:  '#7A6352',
        cream:  { DEFAULT: '#FAF6EE', 2: '#F3EBD8', 3: '#E8DBBF' },
        card:   '#FFFCF6',
        bdr:    { DEFAULT: '#E2D5C3', 2: '#C9B89E' },
        bocata: {
          red:   '#9B2A1A',
          red2:  '#C13B26',
          'red-light': '#F5EAE7',
          amber: '#B56B1E',
          'amber-light': '#FBF0E0',
          green: '#2A6A3B',
          'green-light': '#E6F3EB',
          gold:  '#C9941A',
        },
      },
      borderRadius: {
        card: '20px',
        btn:  '12px',
        tag:  '100px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(28,18,8,.06), 0 4px 16px rgba(28,18,8,.08)',
        'card-hover': '0 2px 8px rgba(28,18,8,.1), 0 12px 40px rgba(28,18,8,.12)',
      },
    },
  },
  plugins: [],
}

export default config
