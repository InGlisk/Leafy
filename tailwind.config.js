/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        leaf: {
          50:  '#f2f7f0',
          100: '#e0edd9',
          200: '#c2dab6',
          300: '#99c289',
          400: '#70a85e',
          500: '#4f8c3f',
          600: '#3c7030',
          700: '#305928',
          800: '#284823',
          900: '#223c1e',
          950: '#0e1f0d',
        },
        soil: {
          50:  '#faf5f0',
          100: '#f2e6d9',
          200: '#e4ccb3',
          300: '#d3aa84',
          400: '#c08758',
          500: '#b07040',
          600: '#9a5c34',
          700: '#7f4a2c',
          800: '#693e28',
          900: '#573525',
          950: '#2e1a11',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
};
