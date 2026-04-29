/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#062418',
          800: '#0B3D2E',
          700: '#0F4F3C',
          600: '#13624A',
        },
        moss: {
          500: '#4F7942',
          400: '#6B9C58',
          300: '#9DC986',
        },
        gold: {
          500: '#FFD700',
          400: '#FFE45C',
          600: '#D4A700',
        },
        canopy: '#01180F',
        bark: '#2A1F12',
      },
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'jungle-radial': 'radial-gradient(circle at 50% 30%, rgba(255,215,0,0.18), transparent 60%), linear-gradient(180deg, #062418 0%, #01180F 100%)',
      },
      boxShadow: {
        glow: '0 0 60px 10px rgba(255,215,0,0.45)',
        glowSoft: '0 0 30px 4px rgba(255,215,0,0.25)',
        vine: 'inset 0 0 0 1px rgba(157,201,134,0.25)',
      },
      keyframes: {
        sway: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        swing: {
          '0%,100%': { transform: 'translateY(0) rotate(-6deg)' },
          '50%': { transform: 'translateY(-6px) rotate(6deg)' },
        },
        fireflies: {
          '0%,100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        sway: 'sway 5s ease-in-out infinite',
        swing: 'swing 1.4s ease-in-out infinite',
        fireflies: 'fireflies 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
