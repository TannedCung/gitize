module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Allow unused variables that start with underscore
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // Relax some rules for UI components
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
      // More relaxed rules for test files
      files: ['**/*.test.tsx', '**/*.test.ts', '**/*.stories.tsx'],
      rules: {
        'no-unused-vars': 'off',
        'react/no-unescaped-entities': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      // Specific rules for utility files
      files: ['**/utils/**/*.ts', '**/hooks/**/*.ts'],
      rules: {
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            destructuredArrayIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
};
