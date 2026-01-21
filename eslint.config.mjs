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
    ],
  },

  eslint.configs.recommended,
  // Apply TypeScript typed configs only within TS-specific block to avoid affecting non-TS files
  ...angular.configs.tsRecommended,
  // Template rules are applied in a separate block if needed

  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      // Ensure TypeScript parser is used for TS files
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

  // Allow unsafe rules in token generators (they work with dynamic JSON data)
  {
    files: ['projects/**/src/generators/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  // Browser globals for app code
  {
    files: ['src/**/*.ts', 'projects/**/src/**/*.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
  },

  // Allow unused vars in theme storage (placeholder helpers)
  {
    files: ['projects/core/src/lib/theme/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },

  // Scripts: allow unused vars in helper scripts
  {
    files: ['tools/scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  {
    files: ['projects/web/src/app/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['projects/web/src/app/features/*/**'],
              message:
                'Do not import across features. Use core/ or shared/ or an explicit public API.',
            },
          ],
          paths: [
            {
              name: '@angular/common/http',
              importNames: ['HttpClient'],
              message:
                'HttpClient is only allowed in core/api/** or in *.data.ts files. Do not use it in pages/stores/guards.',
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      'projects/web/src/app/**/*.data.ts',
      'projects/web/src/app/core/api/**/*.ts',
      'projects/core/src/lib/api/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['projects/web/src/app/features/*/**'],
              message:
                'Do not import across features. Use core/ or shared/ or an explicit public API.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['projects/web/src/app/**/*.guard.ts', 'projects/web/src/app/**/*.guards.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['projects/web/src/app/features/**', '**/*.data', '**/*.state'],
              message:
                'Guards are boundary-only: do not import feature code/data/state. Use core session/auth and redirect.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['projects/web/src/app/features/**/*.ts'],
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
