import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' }
        }
      },
      animation: {
        'caret-blink': 'caret-blink 1.2s ease-out infinite'
      }
    },
    fontFamily: {
      sans: ['"DM Sans", system-ui, sans-serif', { fontOpticalSizing: 'auto' }],
      display: ['Exo, system-ui, sans-serif', { fontOpticalSizing: 'auto' }]
    }
  },
  darkMode: 'class',
  plugins: [
    nextui({
      prefix: 'app',
      themes: {
        light: {
          colors: {}
        },
        dark: {
          colors: {
            background: '#080a0f',
            chart: {
              1: '#a855f7',
              2: '#d8b4fe',
              3: '#8b5cf6',
              4: '#c4b5fd',
              5: '#f6a550',
              6: '#faca51',
              7: '#ec4899',
              8: '#f9a8d4',
              9: '#0ea5e9',
              10: '#7dd3fc',
              11: '#22c55e',
              12: '#86efac'
            },
            content1: '#0f111a',
            content2: '#191c2c', // Used in skeleton
            content3: '#465e99',
            content4: 'transparent', // Used in skeleton
            default: {
              DEFAULT: '#191c2c',
              2: '#7a86a5',
              700: '#cad7f9'
            },
            error: {
              200: '#fecdd3',
              800: '#9f1239'
            },
            focus: '#ffa726',
            foreground: {
              DEFAULT: '#ffffff',
              invert: '#000',
              1: '#cad7f9',
              2: '#7a86a5'
            },
            outline: '#293041',
            primary: '#cad7f9',
            secondary: '#ffcc80',
            success: '#7ccb69',
            danger: '#d24646'
          }
        }
      }
    })
  ]
};
