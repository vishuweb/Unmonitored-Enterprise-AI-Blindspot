/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
          900: '#121215',
          850: '#17171c',
          800: '#202027',
          750: '#282832',
          700: '#343442',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      keyframes: {
        'pulse-fast': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.2)' },
        },
        'glow-pulse-rose': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(244,63,94,0.3), 0 0 20px rgba(244,63,94,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(244,63,94,0.6), 0 0 40px rgba(244,63,94,0.2)' },
        },
        'glow-pulse-emerald': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(52,211,153,0.3), 0 0 20px rgba(52,211,153,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(52,211,153,0.6), 0 0 40px rgba(52,211,153,0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0px)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0px)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'orb-move-1': {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(5%, 8%) scale(1.1)' },
          '66%': { transform: 'translate(-3%, 5%) scale(0.95)' },
        },
        'orb-move-2': {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(-6%, -5%) scale(1.15)' },
          '66%': { transform: 'translate(4%, -8%) scale(0.9)' },
        },
        'ripple': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-fast': 'pulse-fast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-pulse-rose': 'glow-pulse-rose 2s ease-in-out infinite',
        'glow-pulse-emerald': 'glow-pulse-emerald 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin-slow 8s linear infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'scan-line': 'scan-line 6s linear infinite',
        'orb-move-1': 'orb-move-1 20s ease-in-out infinite',
        'orb-move-2': 'orb-move-2 25s ease-in-out infinite',
        'ripple': 'ripple 1.5s ease-out infinite',
        'border-flow': 'border-flow 3s ease infinite',
        'count-up': 'count-up 0.5s ease-out forwards',
        'stagger-in': 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      dropShadow: {
        'glow-indigo': '0 0 8px rgba(99,102,241,0.8)',
        'glow-rose': '0 0 8px rgba(244,63,94,0.8)',
        'glow-emerald': '0 0 8px rgba(52,211,153,0.8)',
        'glow-cyan': '0 0 8px rgba(34,211,238,0.8)',
      },
      backgroundSize: {
        '200%': '200%',
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
