import CraftPlugin from '@kubb/craft-core/plugin'
import path from "node:path";

export default {
  plugins: [
    CraftPlugin.vite(),
  ],
  build: {
    target: 'node16',
    lib: {
      entry: path.resolve(__dirname, './main.ts'),
      name: 'CraftProject',
      fileName: (format) => `craft-project.${format}.js`,
      formats: ['es', 'cjs'], // optional, you can choose formats
    },
    rollupOptions: {
      external: [
        '@kubb/craft-core', // keep your craft-core Node package external
        'fs',
        'path',
        'os',
        'process',
      ]
    },
  },
}
