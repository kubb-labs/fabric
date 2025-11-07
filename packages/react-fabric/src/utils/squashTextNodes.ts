import { createExport, createImport, print } from '@kubb/fabric-core/parsers/typescript'

import type { File } from '../components/File.tsx'
import { nodeNames } from '../dom.ts'
import type { DOMElement } from '../types.ts'

export function squashTextNodes(node: DOMElement): string {
  let text = ''

  const nodeNameSet = new Set(nodeNames)
  nodeNameSet.add('br')

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
            const attributes = child.attributes as React.ComponentProps<typeof File.Import>
            return print(
              createImport({
                name: attributes.name,
                path: attributes.path,
                root: attributes.root,
                isTypeOnly: attributes.isTypeOnly,
                isNameSpace: attributes.isNameSpace,
              }),
            )
          }
          case 'kubb-export': {
            const attributes = child.attributes as React.ComponentProps<typeof File.Export>
            if (attributes.path) {
              return print(
                createExport({
                  name: attributes.name,
                  path: attributes.path,
                  isTypeOnly: attributes.isTypeOnly,
                  asAlias: attributes.asAlias,
                }),
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

        if (!nodeNameSet.has(child.nodeName)) {
          const attributes = child.attributes
          let attrString = ''
          let hasAttributes = false

          for (const key of Object.keys(attributes)) {
            hasAttributes = true
            const value = attributes[key]
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
