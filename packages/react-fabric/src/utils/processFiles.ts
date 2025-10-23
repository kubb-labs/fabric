import { nodeNames } from '../dom.ts'
import { squashExportNodes } from './squashExportNodes.ts'
import { squashImportNodes } from './squashImportNodes.ts'
import { squashSourceNodes } from './squashSourceNodes.ts'

import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { File } from '../components/File.tsx'
import type { DOMElement } from '../types.ts'
import type { FileManager } from '@kubb/fabric-core'

export function processFiles(node: DOMElement, fileManager: FileManager) {
  for (let index = 0; index < node.childNodes.length; index++) {
    const childNode = node.childNodes[index]

    if (!childNode) {
      continue
    }

    if (childNode.nodeName !== '#text' && childNode.nodeName !== 'kubb-file' && nodeNames.includes(childNode.nodeName)) {
      processFiles(childNode, fileManager)
    }

    if (childNode.nodeName === 'kubb-file') {
      const attributes = childNode.attributes as React.ComponentProps<typeof File>

      if (attributes.baseName && attributes.path) {
        const sources = squashSourceNodes(childNode, ['kubb-export', 'kubb-import'])

        const file: KubbFile.File = {
          baseName: attributes.baseName,
          path: attributes.path,
          sources: [...sources],
          exports: [...squashExportNodes(childNode)],
          imports: [...squashImportNodes(childNode)],
          meta: attributes.meta || {},
          footer: attributes.footer,
          banner: attributes.banner,
        }

        fileManager.add(file)
      }
    }
  }
}
