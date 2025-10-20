import tsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/mocks/**'],
    coverage: {
      exclude: [
        '**/dist/**',
        '**/mocks/**',
        '**/configs/**',
        '**/examples/**',
        '**/scripts/**',
        '**/index.ts',
        '**/types.ts',
        '**/jsx-runtime.ts',
        '**/bin/**',
        '**/e2e/**',
        '**/coverage/**',
        '**/__snapshots__/**',
        '**/packages/*/test?(s)/**',
        '**/*.d.ts',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsdown,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
      ],
    },
  },
  plugins: [tsconfigPaths()],
})
