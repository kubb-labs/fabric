import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    parsers: 'src/parsers/index.ts',
    plugins: 'src/plugins/index.ts',
  },
  dts: true,
  target: 'es2019',
  platform: 'node',
  format: ['esm', 'cjs'],
  sourcemap: true,
  shims: true,
  exports: true,
  fixedExtension: false,
})
