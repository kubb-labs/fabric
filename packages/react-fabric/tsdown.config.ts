import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    devtools: 'src/devtools.ts',
    globals: 'src/globals.ts',
    'jsx-runtime': './src/jsx-runtime.ts',
  },
  dts: true,
  target: 'es2019',
  platform: 'node',
  format: ['esm', 'cjs'],
  sourcemap: true,
  shims: true,
  exports: true,
  noExternal: [/react/, /indent-string/],
})
