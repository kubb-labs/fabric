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

        sources.add({
          name: child.attributes.get('name'),
          isTypeOnly: child.attributes.get('isTypeOnly') ?? false,
          isExportable: child.attributes.get('isExportable') ?? false,
          isIndexable: child.attributes.get('isIndexable') ?? false,
          // trim whitespace/newlines
          value: value.trim().replace(/^\s+|\s+$/g, ''),
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
