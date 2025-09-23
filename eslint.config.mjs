import js from '@eslint/js'
import * as tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'next-env.d.ts',
      'scripts/run-prisma-with-env.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended, // bisa ganti ke recommendedTypeChecked bila ingin type-aware
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]
