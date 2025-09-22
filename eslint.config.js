const nextPlugin = require('@next/eslint-plugin-next');
const { configs: tsConfigs } = require('typescript-eslint');

module.exports = [
  {
    ignores: ['scripts/run-prisma-with-env.js', '.next/'],
  },
  ...tsConfigs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: nextPlugin.configs.recommended.rules,
  },
];