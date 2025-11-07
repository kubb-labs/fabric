import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { File } from '../components/File.tsx'
import { nodeNames } from '../dom.ts'
import type { DOMElement } from '../types.ts'

export function squashExportNodes(node: DOMElement): Set<KubbFile.ResolvedExport> {
  const exports = new Set<KubbFile.ResolvedExport>()

  const walk = (current: DOMElement): void => {
    for (const child of current.childNodes) {
      if (!child) {
        continue
      }

      if (child.nodeName !== '#text' && nodeNames.has(child.nodeName)) {
        walk(child)
      }

      if (child.nodeName === 'kubb-export') {
        exports.add({
          name: child.attributes.get('name'),
          path: child.attributes.get('path'),
          isTypeOnly: child.attributes.get('isTypeOnly'),
          asAlias: child.attributes.get('asAlias'),
        } as React.ComponentProps<typeof File.Export>)
      }
    }
  }

  walk(node)
  return exports
}
