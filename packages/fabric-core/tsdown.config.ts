import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'parsers/typescript': 'src/parsers/typescript.ts',
    'parsers/tsx': 'src/parsers/tsx.ts',
  },
  dts: true,
  target: 'es2019',
  format: ['esm', 'cjs'],
  platform: 'node',
  sourcemap: true,
  shims: true,
  exports: true,
})
