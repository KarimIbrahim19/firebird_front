/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'sans': ['Cairo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Hide scrollbar for Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          /* Hide scrollbar for IE, Edge and Firefox */
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
      })
    },
    function({ addBase, theme }) {
      addBase({
        '[dir="rtl"]': {
          '.ltr\\:hidden': {
            display: 'block',
          },
          '.rtl\\:hidden': {
            display: 'none',
          },
          '.ml-auto': {
            marginLeft: '0',
            marginRight: 'auto',
          },
          '.mr-auto': {
            marginRight: '0',
            marginLeft: 'auto',
          },
          '.ml-2': {
            marginLeft: '0',
            marginRight: theme('spacing.2'),
          },
          '.mr-2': {
            marginRight: '0',
            marginLeft: theme('spacing.2'),
          },
          '.ml-3': {
            marginLeft: '0',
            marginRight: theme('spacing.3'),
          },
          '.mr-3': {
            marginRight: '0',
            marginLeft: theme('spacing.3'),
          },
          '.ml-4': {
            marginLeft: '0',
            marginRight: theme('spacing.4'),
          },
          '.mr-4': {
            marginRight: '0',
            marginLeft: theme('spacing.4'),
          },
          '.pl-4': {
            paddingLeft: '0',
            paddingRight: theme('spacing.4'),
          },
          '.pr-4': {
            paddingRight: '0',
            paddingLeft: theme('spacing.4'),
          },
          '.pl-64': {
            paddingLeft: '0',
            paddingRight: theme('spacing.64'),
          },
          '.pr-64': {
            paddingRight: '0',
            paddingLeft: theme('spacing.64'),
          },
          '.left-0': {
            left: 'auto',
            right: '0',
          },
          '.right-0': {
            right: 'auto',
            left: '0',
          },
          '.border-l': {
            borderLeft: '0',
            borderRight: '1px solid',
          },
          '.border-r': {
            borderRight: '0',
            borderLeft: '1px solid',
          },
          '.rounded-l': {
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderTopRightRadius: theme('borderRadius.DEFAULT'),
            borderBottomRightRadius: theme('borderRadius.DEFAULT'),
          },
          '.rounded-r': {
            borderTopRightRadius: '0',
            borderBottomRightRadius: '0',
            borderTopLeftRadius: theme('borderRadius.DEFAULT'),
            borderBottomLeftRadius: theme('borderRadius.DEFAULT'),
          },
          '.space-x-2 > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-x-reverse': '1',
          },
          '.space-x-3 > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-x-reverse': '1',
          },
          '.space-x-4 > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-x-reverse': '1',
          },
          'translate-x-0': {
            transform: 'translateX(0)',
          },
          'translate-x-full': {
            transform: 'translateX(-100%)',
          },
          '-translate-x-full': {
            transform: 'translateX(100%)',
          },
        }
      })
    }
  ],
}