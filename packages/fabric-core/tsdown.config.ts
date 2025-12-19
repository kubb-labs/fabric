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
  target: 'es2019',
  format: ['esm', 'cjs'],
  platform: 'node',
  sourcemap: true,
  shims: true,
  exports: true,
  noExternal: [/remeda/],
  fixedExtension: false,
})
