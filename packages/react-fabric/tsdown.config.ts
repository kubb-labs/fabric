import { defineConfig, type UserConfig } from 'tsdown'

const entry = {
  index: 'src/index.ts',
  types: 'src/types.ts',
  globals: 'src/globals.ts',
  'jsx-runtime': './src/jsx-runtime.ts',
  'jsx-dev-runtime': './src/jsx-dev-runtime.ts',
  parsers: 'src/parsers/index.ts',
  plugins: 'src/plugins/index.ts',
}

const shared: Partial<UserConfig> = {
  platform: 'node',
  sourcemap: true,
  shims: true,
  exports: true,
  fixedExtension: false,
  outputOptions: {
    keepNames: true,
  },
  inlineOnly: false,
}

export default defineConfig([
  {
    entry,
    format: 'esm',
    dts: true,
    ...shared,
  },
  {
    entry,
    format: 'cjs',
    dts: false,
    ...shared,
  },
])
