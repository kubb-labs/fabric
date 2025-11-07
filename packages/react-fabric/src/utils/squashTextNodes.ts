import { createExport, createImport, print } from '@kubb/fabric-core/parsers/typescript'

import { nodeNames } from '../dom.ts'
import type { DOMElement, KubbFile } from '../types.ts'

export function squashTextNodes(node: DOMElement): string {
  let text = ''

  const walk = (current: DOMElement): string => {
    let content = ''

    for (const child of current.childNodes) {
      if (!child) {
        continue
      }

      let nodeText = ''

      const getPrintText = (text: string): string => {
        switch (child.nodeName) {
          case 'kubb-import': {
            return print(
              createImport({
                name: child.attributes.get('name'),
                path: child.attributes.get('path'),
                root: child.attributes.get('root'),
                isTypeOnly: child.attributes.get('isTypeOnly'),
                isNameSpace: child.attributes.get('isNameSpace'),
              } as KubbFile.Import),
            )
          }
          case 'kubb-export': {
            if (child.attributes.has('path')) {
              return print(
                createExport({
                  name: child.attributes.get('name'),
                  path: child.attributes.get('path'),
                  isTypeOnly: child.attributes.get('isTypeOnly'),
                  asAlias: child.attributes.get('asAlias'),
                } as KubbFile.Export),
              )
            }
            return ''
          }
          case 'kubb-source':
            return text
          default:
            return text
        }
      }

      if (child.nodeName === '#text') {
        nodeText = child.nodeValue
      } else {
        if (child.nodeName === 'kubb-text' || child.nodeName === 'kubb-file' || child.nodeName === 'kubb-source') {
          nodeText = walk(child)
        }

        nodeText = getPrintText(nodeText)

        if (child.nodeName === 'br') {
          nodeText = '\n'
        }

        if (!nodeNames.has(child.nodeName)) {
          const attributes = child.attributes
          let attrString = ''
          const hasAttributes = attributes.size > 0

          for (const [key, value] of attributes) {
            attrString += typeof value === 'string' ? ` ${key}="${value}"` : ` ${key}={${String(value)}}`
          }

          if (hasAttributes) {
            nodeText = `<${child.nodeName}${attrString}>${walk(child)}</${child.nodeName}>`
          } else {
            nodeText = `<${child.nodeName}>${walk(child)}</${child.nodeName}>`
          }
        }
      }

      content += nodeText
    }

    return content
  }

  text = walk(node)

  return text
}
