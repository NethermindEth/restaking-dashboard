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
          colors: {
            background: '#ffffff',
            default: '#e0e7ff',
            content1: '#eef2ff',
            focus: '#34d399',
            foreground: '#000000',
            'dark-blue': '#009CDD'
          }
        },
        dark: {
          colors: {
            background: '#080a0f',
            content1: '#0f111a',
            content2: 'red',
            content3: 'yellow',
            content4: 'green',
            default: {
              DEFAULT: '#191c2c'
            },
            focus: '#34d399',
            foreground: {
              DEFAULT: '#ffffff',
              active: '#CAD7F9',
              1: '#c4cce3',
              2: '#7a86a5'
            },
            outline: '#293041',
            secondary: '#FFCC80',
            'dark-blue': '#009CDD'
          }
        }
      }
    })
  ]
};
