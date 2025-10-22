import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    'parsers/typescript': 'src/parsers/typescriptParser.ts',
    'parsers/tsx': 'src/parsers/tsxParser.ts',
    'parsers/default': 'src/parsers/defaultParser.ts',
    'plugins/fs': 'src/plugins/fsPlugin.ts',
  },
  dts: true,
  target: 'es2019',
  format: ['esm', 'cjs'],
  platform: 'node',
  sourcemap: true,
  shims: true,
  exports: true,
})
