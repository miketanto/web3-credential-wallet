module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb',
    // 'airbnb-typescript',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:security/recommended',
    // place these as last (order is important)
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      globalReturn: false,
      jsx: true,
    },
    ecmaVersion: 12,
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    // 'jest',
  ],
  rules: {
    // 1 is 'warning', 2 is 'error' (error prevents compiling)
    'linebreak-style': 0,
    semi: [1, 'never'],
    camelcase: 'warn',
    'comma-dangle': [1, 'always-multiline'],
    'consistent-return': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [1, {
      devDependencies: false, optionalDependencies: false, peerDependencies: false,
    }],
    'max-classes-per-file': 'off',
    'max-len': [1, { code: 200 }],
    'no-async-promise-executor': 'warn',
    'no-await-in-loop': 'warn',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-shadow': 'warn',
    'no-underscore-dangle': 'off',
    'no-unused-vars': 'warn',
    'one-var': 'off',
    'one-var-declaration-per-line': 'off',
    radix: 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }], // enable JSX in .tsx
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    // 'jsx-a11y/anchor-is-valid': ['error', {
    //   components: ['Link'],
    //   specialLink: ['to'],
    // }],

    // typescripts
    '@typescript-eslint/semi': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: [
        '**/*.stories.*',
      ],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
}
