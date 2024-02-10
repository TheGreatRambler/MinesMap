import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'open-sans': ['Open Sans', 'sans-serif'],
        'oswald': ['Oswald', 'Impact', 'sans-serif']
      },
      gridRow: {
        'span-16': 'span 16 / span 16',
      },
      gridTemplateRows: {
        // Simple 16 row grid
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    }
  },
  plugins: [],
};

export default config;
