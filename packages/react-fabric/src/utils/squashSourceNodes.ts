import type { KubbFile } from '@kubb/fabric-core/types'
import { createConst, createFunction, createTypeAlias } from '@kubb/fabric-core/parsers/typescript'
import type ts from 'typescript'

import { nodeNames } from '../dom.ts'
import type { DOMElement, ElementNames } from '../types.ts'
import { squashTextNodes } from './squashTextNodes.ts'

/**
 * Walk a source DOM subtree and collect AST nodes from kubb-function, kubb-const,
 * and kubb-type elements. This is the same pattern as squashImportNodes/squashExportNodes
 * but for top-level declarations inside a source block.
 */
function collectAstNodes(node: DOMElement): Array<ts.Node> {
  const nodes: Array<ts.Node> = []

  const walk = (current: DOMElement): void => {
    for (const child of current.childNodes) {
      if (!child || child.nodeName === '#text') {
        continue
      }

      if (child.nodeName === 'kubb-function') {
        const attrs = child.attributes
        nodes.push(
          createFunction({
            name: attrs.get('name') as string,
            params: attrs.get('params') as string | undefined,
            export: attrs.get('export') as boolean | undefined,
            default: attrs.get('default') as boolean | undefined,
            async: attrs.get('async') as boolean | undefined,
            generics: attrs.get('generics') as string | undefined,
            returnType: attrs.get('returnType') as string | undefined,
          } as KubbFile.FunctionNode),
        )
      } else if (child.nodeName === 'kubb-const') {
        const attrs = child.attributes
        nodes.push(
          createConst({
            name: attrs.get('name') as string,
            type: attrs.get('type') as string | undefined,
            export: attrs.get('export') as boolean | undefined,
            asConst: attrs.get('asConst') as boolean | undefined,
          } as KubbFile.ConstNode),
        )
      } else if (child.nodeName === 'kubb-type') {
        const attrs = child.attributes
        nodes.push(
          createTypeAlias({
            name: attrs.get('name') as string,
            export: attrs.get('export') as boolean | undefined,
          } as KubbFile.TypeNode),
        )
      } else {
        walk(child)
      }
    }
  }

  walk(node)
  return nodes
}

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
        const astNodes = collectAstNodes(child)

        const source: KubbFile.Source = {
          name: child.attributes.get('name'),
          isTypeOnly: (child.attributes.get('isTypeOnly') ?? false) as boolean,
          isExportable: (child.attributes.get('isExportable') ?? false) as boolean,
          isIndexable: (child.attributes.get('isIndexable') ?? false) as boolean,
          // trim whitespace/newlines
          value: value.trim().replace(/^\s+|\s+$/g, ''),
        }

        if (astNodes.length > 0) {
          source.nodes = astNodes
        }

        sources.add(source)
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
