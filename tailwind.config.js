/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutres
        bg: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F1F5F9',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        text: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          subtle: '#64748B',
        },
        // Marque
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#EFF6FF',
          ring: '#93C5FD',
        },
        // IA
        ai: {
          DEFAULT: '#6D28D9',
          soft: '#F5F3FF',
          border: '#DDD6FE',
        },
        // Sémantique
        success: { DEFAULT: '#15803D', soft: '#DCFCE7' },
        warning: { DEFAULT: '#B45309', soft: '#FEF3C7' },
        danger: { DEFAULT: '#B91C1C', soft: '#FEE2E2' },
        info: { DEFAULT: '#0369A1', soft: '#E0F2FE' },
        // Échelle de score (4 paliers)
        score: {
          1: '#B91C1C',
          '1-bg': '#FEE2E2',
          2: '#B45309',
          '2-bg': '#FEF3C7',
          3: '#0369A1',
          '3-bg': '#E0F2FE',
          4: '#15803D',
          '4-bg': '#DCFCE7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06)',
        modal: '0 20px 50px rgb(15 23 42 / 0.20)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        overlayIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        panelIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'overlay-in': 'overlayIn 0.18s ease-out',
        'panel-in': 'panelIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};