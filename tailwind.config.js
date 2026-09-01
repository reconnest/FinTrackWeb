/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neo: {
          bg:       '#0B0E14',
          surface:  '#131822',
          card:     '#1A212E',
          cardHover:'#20293A',
          border:   '#263042',
          borderLight: '#323E56',
          muted:    '#8E9BAE',
          text:     '#F1F5F9',
          emerald:  '#10B981',
          neonGreen:'#00E676',
          crimson:  '#FF4757',
          coral:    '#FF6B6B',
          cyan:     '#00D2FF',
          blue:     '#3B82F6',
          purple:   '#8B5CF6',
          amber:    '#F59E0B',
          gold:     '#FBBF24',
        },
        ft: {
          green:  '#00E676',
          red:    '#FF4757',
          blue:   '#00D2FF',
          orange: '#F59E0B',
          primary:'#10B981',
          bg:     '#0B0E14',
          surface:'#131822',
          card:   '#1A212E',
          border: '#263042',
          muted:  '#8E9BAE',
          text:   '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace']
      },
      boxShadow: {
        'neo-glow-green': '0 0 25px -5px rgba(0, 230, 118, 0.25)',
        'neo-glow-blue':  '0 0 25px -5px rgba(0, 210, 255, 0.25)',
        'neo-glow-purple':'0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'neo-card':       '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        }
      },
      animation: {
        'slideUp':   'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideIn':   'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'popIn':     'popIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulseGlow': 'pulseGlow 2.5s ease-in-out infinite',
      }
    }
  },
  plugins: []
}
