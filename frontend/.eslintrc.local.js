module.exports = {
  extends: ['./.eslintrc.json'],
  rules: {
    // Temporarily disable problematic rules for UI components
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'react/no-unescaped-entities': [
      'error',
      {
        forbid: ['>', '}'],
      },
    ],
    '@next/next/no-img-element': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['**/*.stories.tsx', '**/*.test.tsx'],
      rules: {
        'no-unused-vars': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
  ],
};
