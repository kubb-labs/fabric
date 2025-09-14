import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    factory: 'src/factory.ts',
  },
  dts: true,
  target: 'es2019',
  format: ['esm', 'cjs'],
  platform: 'node',
  sourcemap: true,
  shims: true,
  exports: true,
})
