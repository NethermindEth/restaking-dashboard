import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactJSXRutime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  reactRecommended,
  reactJSXRutime,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['dist/'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      'react-refresh': reactRefresh,
      'react-hooks': reactHooks
    },
    rules: {
      'sort-imports': [
        'warn',
        {
          allowSeparatedGroups: false,
          ignoreCase: true,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
        }
      ],
      'react/jsx-no-target-blank': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': 'warn',
      ...reactHooks.configs.recommended.rules
    },
    settings: { react: { version: '18.2' } }
  }
];
