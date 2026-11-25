import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#14304F',
          dark: '#0D2238',
          overlay: '#12294A',
        },
        page: '#E1E8F5',
        heading: '#16293F',
        slate: '#3B4C63',
        brandYellow: '#FFD81B',
        gold: {
          line: '#E3C54A',
          link: '#B89600',
        },
        success: {
          bg: '#22C55E',
          text: '#166534',
        },
        warning: '#F5822A',
        info: '#2F6FED',
        chartGreen: '#3DC47A',
        authCard: '#34475A',
        authOverlay: '#0B1624',
        surface: '#FFFFFF',
        textPrimary: '#16293F',
        textMuted: '#6B7280',
        inputBorder: '#1A1A1A',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        control: '16px',
        pill: '9999px',
        navPill: '20px',
        badge: '9999px',
      },
      spacing: {
        // Using default 4px scale
      },
      boxShadow: {
        DEFAULT: 'none',
        subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      screens: {
        mobile: '640px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config