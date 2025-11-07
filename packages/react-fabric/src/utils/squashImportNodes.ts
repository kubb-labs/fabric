import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { File } from '../components/File.tsx'
import { nodeNames } from '../dom.ts'
import type { DOMElement } from '../types.ts'

export function squashImportNodes(node: DOMElement): Set<KubbFile.Import> {
  const nodeNameSet = new Set(nodeNames)
  const imports = new Set<KubbFile.Import>()

  const traverse = (current: DOMElement): void => {
    for (const child of current.childNodes) {
      if (!child) {
        continue
      }

      if (child.nodeName !== '#text' && nodeNameSet.has(child.nodeName)) {
        traverse(child)
      }

      if (child.nodeName === 'kubb-import') {
        const attributes = child.attributes as React.ComponentProps<typeof File.Import>
        imports.add(attributes)
      }
    }
  }

  traverse(node)
  return imports
}
