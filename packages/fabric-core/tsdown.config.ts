import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    parsers: 'src/parsers/index.ts',
    'parsers/typescript': 'src/parsers/typescriptParser.ts',
    plugins: 'src/plugins/index.ts',
  },
  dts: true,
  format: ['esm', 'cjs'],
  platform: 'node',
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
