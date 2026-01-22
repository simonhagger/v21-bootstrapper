import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      'tailwind.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'e2e/**',
      'src/test.ts',
      '**/*.spec.ts',
    ],
  },

  eslint.configs.recommended,
  ...angular.configs.tsRecommended,

  {
    files: ['**/*.ts'],
    ignores: ['**/*.spec.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      'linebreak-style': ['error', 'unix'],

      'no-restricted-syntax': [
        'error',
        {
          selector: "Decorator[name.name='NgModule']",
          message: 'Do not use NgModule. Use standalone components and functional providers.',
        },
      ],
    },
  },

  // Node environment for scripts and CJS config files
  {
    files: ['tools/scripts/**/*.mjs', '**/*.cjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
  },

  // Vitest globals for spec files
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        expect: 'readonly',
      },
    },
  },

  // Browser globals for app code
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
  },

  // Feature-specific rules
  {
    files: ['src/app/features/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value='root']",
          message:
            "Do not use providedIn: 'root' in features. Provide services at route level via providers: [..].",
        },
      ],
    },
  },
];
