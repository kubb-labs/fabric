import type { KubbFile } from '@kubb/fabric-core/types'

import { nodeNames } from '../dom.ts'
import type { DOMElement } from '../types.ts'

export function squashExportNodes(node: DOMElement): Set<KubbFile.Export> {
  const exports = new Set<KubbFile.Export>()

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
          isTypeOnly: child.attributes.get('isTypeOnly') ?? false,
          asAlias: child.attributes.get('asAlias') ?? false,
        } as KubbFile.Export)
      }
    }
  }

  walk(node)
  return exports
}
