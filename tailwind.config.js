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
            content2: '#191c2c',
            content3: 'yellow',
            content4: 'transparent',
            default: {
              DEFAULT: '#191c2c',
              2: '#7A86A5',
              700: '#cad7F9'
            },
            focus: '#34d399',
            foreground: {
              DEFAULT: '#ffffff',
              active: '#CAD7F9',
              1: '#cad7F9',
              2: '#7a86a5'
            },
            outline: '#293041',
            primary: '#cad7F9',
            secondary: '#FFCC80',
            subtitle: '#7A86A5',
            success: '#7CCB69',
            disabled: '#52525B',
            fail: '#D24646',
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
