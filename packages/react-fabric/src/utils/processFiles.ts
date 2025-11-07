import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { File } from '../components/File.tsx'
import { nodeNames } from '../dom.ts'
import type { DOMElement } from '../types.ts'
import { squashExportNodes } from './squashExportNodes.ts'
import { squashImportNodes } from './squashImportNodes.ts'
import { squashSourceNodes } from './squashSourceNodes.ts'

export async function processFiles(node: DOMElement): Promise<Array<KubbFile.File>> {
  const collected: Array<KubbFile.File> = []

  async function walk(current: DOMElement) {
    for (const childNode of current.childNodes) {
      if (!childNode) {
        continue
      }

      if (childNode.nodeName !== '#text' && childNode.nodeName !== 'kubb-file' && nodeNames.has(childNode.nodeName)) {
        await walk(childNode)
      }

      if (childNode.nodeName === 'kubb-file') {
        const attributes = childNode.attributes as React.ComponentProps<typeof File>

        if (attributes.baseName && attributes.path) {
          const sources = squashSourceNodes(childNode, ['kubb-export', 'kubb-import'])

          collected.push({
            baseName: attributes.baseName,
            path: attributes.path,
            sources: [...sources],
            exports: [...squashExportNodes(childNode)],
            imports: [...squashImportNodes(childNode)],
            meta: attributes.meta || {},
            footer: attributes.footer,
            banner: attributes.banner,
          })
        }
      }
    }
  }

  await walk(node)

  return collected
}
