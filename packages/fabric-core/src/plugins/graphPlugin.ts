import http from 'node:http'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import handler from 'serve-handler'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'
import { open } from '../utils/open.ts'
import { type Graph, TreeNode } from '../utils/TreeNode.ts'
import { definePlugin } from './definePlugin.ts'

type Options = {
  root: string
  /**
   * @default false
   */
  open?: boolean
}

type GetGraphOptions = {
  files: KubbFile.File[]
  root: string
}

export function getGraph({ files, root }: GetGraphOptions): Graph | undefined {
  const treeNode = TreeNode.fromFiles(files, root)

  if (!treeNode) {
    return undefined
  }

  return TreeNode.toGraph(treeNode)
}
const html = `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>File Graph</title>
    <script type="module">
      import { Network } from 'https://cdn.jsdelivr.net/npm/vis-network/standalone/esm/vis-network.min.js'

      async function main() {
        const res = await fetch('./graph.json')
        const { nodes, edges } = await res.json()
        const container = document.getElementById('graph')

        const network = new Network(
          container,
          { nodes, edges },
          {
            layout: { hierarchical: { direction: 'UD', sortMethod: 'directed' } },
            nodes: { shape: 'box', font: { face: 'monospace' } },
            edges: { arrows: 'to' },
            physics: false,
          },
        )
      }

      main()
    </script>
    <style>
      html, body, #graph { height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="graph"></div>
  </body>
</html>
`

async function serve(root: string) {
  const server = http.createServer((req, res) => {
    return handler(req, res, {
      public: root,
      cleanUrls: true,
    })
  })

  server.listen(0, async () => {
    const { port } = server.address() as AddressInfo
    console.log(`Running on http://localhost:${port}/graph.html`)

    await open(`http://localhost:${port}/graph.html`)
  })
}

export const graphPlugin = definePlugin<Options>({
  name: 'graph',
  install(ctx, options) {
    if (!options) {
      throw new Error('Graph plugin requires options.root and options.mode')
    }

    ctx.on('files:writing:start', async (files) => {
      const root = options.root

      const graph = getGraph({ files, root })

      if (!graph) {
        return undefined
      }

      const graphFile = createFile({
        baseName: 'graph.json',
        path: path.join(root, 'graph.json'),
        sources: [
          {
            name: 'graph',
            value: JSON.stringify(graph, null, 2),
          },
        ],
        imports: [],
        exports: [],
      })

      const graphHtmlFile = createFile({
        baseName: 'graph.html',
        path: path.join(root, 'graph.html'),
        sources: [
          {
            name: 'graph',
            value: html,
          },
        ],
        imports: [],
        exports: [],
      })

      await ctx.addFile(graphFile, graphHtmlFile)

      if (options.open) {
        await serve(root)
      }
    })
  },
})
