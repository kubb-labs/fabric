import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolveClientRoot } from './src/server/resolveClientRoot.ts'

const clientRoot = resolveClientRoot(import.meta.url)

export default defineConfig({
  root: clientRoot,
  appType: 'spa',
  plugins: [vue()],
  define: {
    __FABRIC_LOGGER_URL__: JSON.stringify(
      process.env.FABRIC_LOGGER_URL ?? 'ws://127.0.0.1:7071/__fabric_logger__',
    ),
  },
  server: {
    host: process.env.FABRIC_DEVTOOLS_HOST ?? '127.0.0.1',
    port: process.env.FABRIC_DEVTOOLS_PORT ? Number(process.env.FABRIC_DEVTOOLS_PORT) : 5175,
  },
})
