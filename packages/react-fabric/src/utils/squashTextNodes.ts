import { renderIndent } from '@kubb/fabric-core'
import { createExport, createImport, print } from '@kubb/fabric-core/parsers/typescript'
import type { RenderContextProps } from '@kubb/fabric-core/types'
import { nodeNames } from '../dom.ts'
import type { DOMElement, KubbFile } from '../types.ts'

export function squashTextNodes(
  node: DOMElement,
  renderContext: RenderContextProps = { indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false },
): string {
  let text = ''

  const walk = (current: DOMElement, context: RenderContextProps): string => {
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
          case 'kubb-function': {
            const attrs = child.attributes
            const name = attrs.get('name') as string
            const params = (attrs.get('params') as string | undefined) || ''
            const isExport = attrs.get('export') as boolean | undefined
            const isDefault = attrs.get('default') as boolean | undefined
            const isAsync = attrs.get('async') as boolean | undefined
            const generics = attrs.get('generics') as string | undefined
            const returnType = attrs.get('returnType') as string | undefined

            const parts: string[] = []
            if (isExport) parts.push('export ')
            if (isDefault) parts.push('default ')
            if (isAsync) parts.push('async ')
            parts.push(`function ${name}`)
            if (generics) {
              parts.push(`<${generics}>`)
            }
            parts.push(`(${params})`)
            if (returnType && !isAsync) parts.push(`: ${returnType}`)
            if (returnType && isAsync) parts.push(`: Promise<${returnType}>`)

            const signature = renderIndent(parts.join(''), context)
            context.currentLineLength = parts.join('').length

            context.indentLevel++
            context.currentLineLength = 0
            const body = walk(child, context)
            context.indentLevel--
            context.currentLineLength = 0

            const closingIndent = ' '.repeat(context.indentLevel * context.indentSize)
            if (body.trim()) {
              return `${signature} {\n${body}\n${closingIndent}}`
            }
            return `${signature} {}`
          }
          case 'kubb-const': {
            const attrs = child.attributes
            const name = attrs.get('name') as string
            const type = attrs.get('type') as string | undefined
            const isExport = attrs.get('export') as boolean | undefined
            const asConst = attrs.get('asConst') as boolean | undefined

            const parts: string[] = []
            if (isExport) parts.push('export ')
            parts.push(`const ${name}`)
            if (type) {
              parts.push(`:${type} `)
            } else {
              parts.push(' ')
            }

            const signature = renderIndent(parts.join(''), context)
            context.currentLineLength = parts.join('').length

            const body = walk(child, context)
            let result = `${signature}= ${body}`
            if (asConst) result += ' as const'
            return result
          }
          case 'kubb-type': {
            const attrs = child.attributes
            const name = attrs.get('name') as string
            const isExport = attrs.get('export') as boolean | undefined

            const parts: string[] = []
            if (isExport) parts.push('export ')
            parts.push(`type ${name} = `)

            const signature = renderIndent(parts.join(''), context)
            context.currentLineLength = parts.join('').length

            const body = walk(child, context)
            return `${signature}${body}`
          }
          case 'kubb-source':
            return text
          default:
            return text
        }
      }

      if (child.nodeName === '#text') {
        nodeText = renderIndent(child.nodeValue, context)
      } else {
        if (child.nodeName === 'kubb-text' || child.nodeName === 'kubb-file' || child.nodeName === 'kubb-source') {
          nodeText = walk(child, context)
        }

        nodeText = getPrintText(nodeText)

        if (child.nodeName === 'br') {
          nodeText = '\n'
          context.currentLineLength = 0
        }

        if (child.nodeName === 'indent') {
          context.indentLevel++
          nodeText = ''
        }

        if (child.nodeName === 'dedent') {
          context.indentLevel = Math.max(0, context.indentLevel - 1)
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
            nodeText = `<${child.nodeName}${attrString}>${walk(child, context)}</${child.nodeName}>`
          } else {
            nodeText = `<${child.nodeName}>${walk(child, context)}</${child.nodeName}>`
          }
        }
      }

      content += nodeText
    }

    return content
  }

  text = walk(node, renderContext)

  return text
}
