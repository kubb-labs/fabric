import { createExport, createImport, print } from '@kubb/fabric-core/parsers/typescript'
import { inject, provide, RenderContext } from '@kubb/fabric-core'

import { nodeNames } from '../dom.ts'
import type { DOMElement, KubbFile } from '../types.ts'

export function squashTextNodes(node: DOMElement): string {
  // Initialize RenderContext for this render
  const renderContext = inject(RenderContext, { indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false })
  provide(RenderContext, renderContext)

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

      const applyIndent = (text: string): string => {
        if (text.length === 0) {
          return ''
        }

        const indentStr = ' '.repeat(renderContext.indentLevel * renderContext.indentSize)
        const lines = text.split('\n')
        let out = ''

        for (const [i, line] of lines.entries()) {
          if (renderContext.currentLineLength === 0 && line.length > 0) {
            // At start of a line: prefix indentation
            out += indentStr + line
            renderContext.currentLineLength = indentStr.length + line.length
          } else {
            out += line
            renderContext.currentLineLength += line.length
          }

          // If not the last line, add newline and reset line length
          if (i !== lines.length - 1) {
            out += '\n'
            renderContext.currentLineLength = 0
          }
        }

        return out
      }

      if (child.nodeName === '#text') {
        nodeText = applyIndent(child.nodeValue)
      } else {
        if (child.nodeName === 'kubb-text' || child.nodeName === 'kubb-file' || child.nodeName === 'kubb-source') {
          nodeText = walk(child)
        }

        nodeText = getPrintText(nodeText)

        if (child.nodeName === 'br') {
          nodeText = '\n'
          renderContext.currentLineLength = 0
        }

        if (child.nodeName === 'indent') {
          renderContext.indentLevel++
          nodeText = ''
        }

        if (child.nodeName === 'dedent') {
          renderContext.indentLevel = Math.max(0, renderContext.indentLevel - 1)
          nodeText = ''
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
