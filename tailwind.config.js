/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ft: {
          green:  '#2E7D32',
          red:    '#C62828',
          blue:   '#1565C0',
          orange: '#E65100',
          primary:'#1B5E20',
          bg:     '#101410',
          surface:'#1C211C',
          card:   '#262B26',
          border: '#414942',
          muted:  '#C1C9C0',
          text:   '#E1E4DF',
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace']
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slideUp': 'slideUp 0.25s ease-out',
        'slideIn': 'slideIn 0.2s ease-out',
        'fadeIn':  'fadeIn 0.2s ease-out',
      }
    }
  },
  plugins: []
}
