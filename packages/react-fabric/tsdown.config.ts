import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    globals: 'src/globals.ts',
    'jsx-runtime': './src/jsx-runtime.ts',
    'jsx-dev-runtime': './src/jsx-dev-runtime.ts',
    parsers: 'src/parsers/index.ts',
    plugins: 'src/plugins/index.ts',
  },
  dts: true,
  platform: 'node',
  format: ['esm', 'cjs'],
  sourcemap: true,
  shims: true,
  exports: true,
  fixedExtension: false,
  outExtensions({ format }) {
    if (format === 'cjs') return { dts: '.d.ts' }
    return {}
  },
  inlineOnly: false,
})
