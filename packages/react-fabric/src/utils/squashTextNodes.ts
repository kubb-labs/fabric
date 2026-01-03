import { createExport, createImport, print } from '@kubb/fabric-core/parsers/typescript'

import { nodeNames } from '../dom.ts'
import type { DOMElement, KubbFile } from '../types.ts'

export function squashTextNodes(node: DOMElement, context = { indentLevel: 0, indentSize: 2 }): string {
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
        // Handle intrinsic elements using processReactIntrinsics logic
        const intrinsicType = child.attributes.get('__intrinsic')
        if (intrinsicType) {
          const indentStr = ' '.repeat(context.indentLevel * context.indentSize)
          
          switch (intrinsicType) {
            case 'br':
            case 'hbr':
            case 'sbr':
              nodeText = `\n${indentStr}`
              break
            case 'lbr':
              nodeText = '\n'
              break
            case 'indent':
              context.indentLevel++
              nodeText = ''
              break
            case 'dedent':
              context.indentLevel = Math.max(0, context.indentLevel - 1)
              nodeText = ''
              break
            case 'align':
              nodeText = ''
              break
            case 'group':
            case 'fill':
              nodeText = walk(child)
              break
            case 'ifBreak':
              // Basic implementation: use thenContent (children)
              nodeText = walk(child)
              break
            case 'indentIfBreak':
              context.indentLevel++
              nodeText = ''
              break
            default:
              nodeText = ''
          }
        } else if (child.nodeName === 'br') {
          // Fallback for br without __intrinsic marker
          const indentStr = ' '.repeat(context.indentLevel * context.indentSize)
          nodeText = `\n${indentStr}`
        } else if (child.nodeName === 'kubb-text' || child.nodeName === 'kubb-file' || child.nodeName === 'kubb-source') {
          nodeText = walk(child)
          nodeText = getPrintText(nodeText)
        } else {
          nodeText = getPrintText(nodeText)
        }

        if (!nodeNames.has(child.nodeName) && !intrinsicType) {
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
