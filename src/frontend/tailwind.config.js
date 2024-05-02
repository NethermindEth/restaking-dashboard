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
      sans: ['Outfit, system-ui, sans-serif', { fontOpticalSizing: 'auto' }],
      display: [
        'Syncopate, system-ui, sans-serif',
        { fontOpticalSizing: 'auto' }
      ]
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
            focus: '#34d399',
            foreground: '#000000'
          }
        },
        'sidebar-light': {
          colors: {
            background: '#1e1b4b',
            default: '#ffffff',
            focus: '#34d399',
            foreground: '#ffffff',
            primary: '#ffffff'
          }
        },
        'sidebar-dark': {
          colors: {
            background: '#0c0b1e',
            default: '#ffffff',
            focus: '#34d399',
            foreground: '#ffffff',
            primary: '#ffffff'
          }
        },
        dark: {
          colors: {
            background: '#12102d',
            content1: '#18163c',
            default: 'rgb(255 255 255 / 20%)',
            focus: '#34d399',
            foreground: '#ffffff'
          }
        }
      }
    })
  ]
};
