import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
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
              7: '#ffcc80',
              8: '#ec4899',
              9: '#f9a8d4',
              10: '#0ea5e9',
              11: '#7dd3fc',
              12: '#4fc3f7'
            },
            content1: '#0f111a',
            content2: '#191c2c',
            content3: 'yellow',
            content4: 'transparent',
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
            primary: '#cad7F9',
            secondary: '#ffcc80',
            subtitle: '#7a86a5',
            success: '#7CCB69',
            // below to be removed
            'dark-blue': '#009CDD',
            cinder: {
              default: '#576AA0',
              1: '#2D344D',
              2: '#D0D5E7',
              3: '#A7B2D2',
              4: '#37446C',
              5: '#7889B8'
            },
            accent: {
              default: '#FFCC80'
            }
          }
        }
      }
    })
  ]
};
