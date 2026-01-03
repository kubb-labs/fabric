import type { KubbFile } from '@kubb/fabric-core/types'

import { nodeNames } from '../dom.ts'
import type { DOMElement, ElementNames } from '../types.ts'
import { squashTextNodes } from './squashTextNodes.ts'

export function squashSourceNodes(node: DOMElement, ignores: Array<ElementNames>): Set<KubbFile.Source> {
  const ignoreSet = new Set(ignores)
  const sources = new Set<KubbFile.Source>()

  const walk = (current: DOMElement): void => {
    for (const child of current.childNodes) {
      if (!child) {
        continue
      }

      if (child.nodeName !== '#text' && ignoreSet.has(child.nodeName)) {
        continue
      }

      if (child.nodeName === 'kubb-source') {
        const value = squashTextNodes(child)

        const name = child.attributes.get('name')
        const isTypeOnly = child.attributes.get('isTypeOnly') ?? false
        const isExportable = child.attributes.get('isExportable') ?? false
        const isIndexable = child.attributes.get('isIndexable') ?? false

        // Create tree node for this source
        const treeNode: KubbFile.TreeNode = {
          type: 'FileSource',
          props: {
            name,
            isTypeOnly,
            isExportable,
            isIndexable,
          },
        }

        sources.add({
          name,
          isTypeOnly,
          isExportable,
          isIndexable,
          // trim whitespace/newlines
          value: value.trim().replace(/^\s+|\s+$/g, ''),
          tree: treeNode,
        } as KubbFile.Source)
        continue
      }

      if (child.nodeName !== '#text' && nodeNames.has(child.nodeName)) {
        walk(child)
      }
    }
  }

  walk(node)
  return sources
}
