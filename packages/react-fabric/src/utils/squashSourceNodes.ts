import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { File } from '../components/File.tsx'
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
        const attributes = child.attributes as React.ComponentProps<typeof File.Source>
        const value = squashTextNodes(child)

        sources.add({
          ...attributes,
          // trim whitespace/newlines
          value: value.trim().replace(/^\s+|\s+$/g, ''),
        })
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
