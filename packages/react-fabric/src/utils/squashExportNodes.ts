import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { File } from '../components/File.tsx'
import { nodeNames } from '../dom.ts'
import type { DOMElement } from '../types.ts'

export function squashExportNodes(node: DOMElement): Set<KubbFile.ResolvedExport> {
  const nodeNameSet = new Set(nodeNames)
  const exports = new Set<KubbFile.ResolvedExport>()

  const walk = (current: DOMElement): void => {
    for (const child of current.childNodes) {
      if (!child) {
        continue
      }

      if (child.nodeName !== '#text' && nodeNameSet.has(child.nodeName)) {
        walk(child)
      }

      if (child.nodeName === 'kubb-export') {
        const attributes = child.attributes as React.ComponentProps<typeof File.Export>
        exports.add(attributes)
      }
    }
  }

  walk(node)
  return exports
}
