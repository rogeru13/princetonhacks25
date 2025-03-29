/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        'alfa-slab': ['var(--font-alfa-slab)', 'serif'],
      },
      colors: {
        'vintage': {
          50: '#F9F6F0',
          100: '#F2EDE4',
          200: '#E5DBD0',
          900: '#2C2824'
        },
        'brick': {
          100: '#FDE8E8',
          500: '#D64545',
          600: '#BA2525'
        },
        'sage': {
          100: '#E9EFEA',
          500: '#629665',
          600: '#3D6E40'
        },
        'navy': {
          100: '#E6E9EF',
          500: '#2A4365',
          600: '#1A365D'
        },
        'cream': '#F5F1E4',
        'red': {
          700: '#C1272D',
          500: '#E94E4E',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-patterns'),
  ],
} 