import eslintConfigPrettier from 'eslint-config-prettier'
import jestPlugin from 'eslint-plugin-jest'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      'output/**',
      'coverage/**',
      'dist/**',
      'example/**',
      '**/*.min.js',
      'eslint.config.mjs',
      'setupTests.ts',
    ],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/__mocks__/**'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [
      '**/*.{test,spec}.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    extends: [tseslint.configs.disableTypeChecked],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    settings: {
      jest: { version: 29 },
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/no-mocks-import': 'off',
    },
  },
  {
    files: ['**/__mocks__/**/*.{ts,tsx}'],
    extends: [tseslint.configs.disableTypeChecked],
  }
)
