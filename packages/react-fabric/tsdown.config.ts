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
  target: 'es2019',
  platform: 'node',
  format: ['esm', 'cjs'],
  sourcemap: 'hidden', // TODO see if we can enable this again to help with debugging, issue with React Devtools
  shims: true,
  exports: true,
  noExternal: [/indent-string/],
  fixedExtension: false,
  outputOptions: {
    keepNames: true,
  },
})
