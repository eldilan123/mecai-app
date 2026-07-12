// ESLint flat config — MecAI
// Reglas estrictas para React Native + TypeScript (HU-03).
// - eslint-config-expo: entorno Expo/React/React Native + react-hooks
// - typescript-eslint (strict): reglas estrictas de TS sin type-checking (rápidas)
// - eslint-config-prettier: desactiva reglas que chocan con Prettier (formateo lo maneja Prettier)
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const tseslint = require('typescript-eslint')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = defineConfig([
  expoConfig,
  tseslint.configs.strict,
  {
    rules: {
      // No permitir `any` explícito
      '@typescript-eslint/no-explicit-any': 'error',
      // No variables sin usar (se permiten args/vars con prefijo _)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Preferir const cuando no se reasigna
      'prefer-const': 'error',
    },
  },
  // Archivos de configuración CommonJS (.js): se permite require()
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Prettier al final: apaga todo lo de formato para que no pelee con Prettier
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'expo-env.d.ts'],
  },
])
