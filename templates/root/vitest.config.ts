import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/environments/',
        'src/test.ts',
        '**/*.spec.ts',
        'src/main.ts',
      ],
      // Start with low thresholds; increase as codebase matures
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },
});

