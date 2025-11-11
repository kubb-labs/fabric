import fs from 'node:fs'
import path from 'node:path'
import { createServer, type ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolveClientRoot } from './resolveClientRoot.ts'

export interface StartDevtoolsServerOptions {
  host: string
  port: number
  open: boolean
  loggerUrl: string
}

export async function startDevtoolsServer(options: StartDevtoolsServerOptions): Promise<ViteDevServer> {
  const clientRoot = resolveClientRoot(import.meta.url)
  const publicDir = path.join(clientRoot, 'public')

  const server = await createServer({
    configFile: false,
    root: clientRoot,
    appType: 'spa',
    envDir: clientRoot,
    plugins: [vue()],
    define: {
      __FABRIC_LOGGER_URL__: JSON.stringify(options.loggerUrl),
    },
    server: {
      host: options.host,
      port: options.port,
      strictPort: false,
      open: options.open,
    },
    optimizeDeps: {
      include: ['vue', '@nuxt/ui'],
    },
    resolve: {
      alias: {
        '@client': clientRoot,
      },
    },
    publicDir: fs.existsSync(publicDir) ? publicDir : undefined,
  })

  await server.listen()

  return server
}
