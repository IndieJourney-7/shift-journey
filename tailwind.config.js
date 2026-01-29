/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1a1a1a',
          700: '#252525',
          600: '#333333',
          500: '#4a4a4a',
          400: '#666666',
          300: '#888888',
          200: '#aaaaaa',
          100: '#cccccc',
        },
        gold: {
          600: '#b8963d',
          500: '#c9a962',
          400: '#d4b978',
          300: '#e0ca8e',
        },
        amber: {
          900: '#78350f',
          800: '#92400e',
          700: '#b45309',
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
          300: '#fcd34d',
          200: '#fde68a',
        },
        broken: {
          500: '#8b4513',
          400: '#a0522d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(201, 169, 98, 0.4)',
        'glow-sm': '0 0 10px rgba(201, 169, 98, 0.3)',
        'glow-lg': '0 0 30px rgba(245, 158, 11, 0.5)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(201, 169, 98, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'crack': 'crack 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 169, 98, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(201, 169, 98, 0.6)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
