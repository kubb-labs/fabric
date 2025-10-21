import { describe, test, expect } from 'vitest'
import { createNode, createTextNode, appendChildNode, setAttribute } from '../dom.ts'
import { squashImportNodes } from './squashImportNodes.ts'
import type { KubbFile } from '@kubb/fabric-core/types'

function kubbElement(name: string, attrs: Record<string, any> = {}) {
  const el = createNode(name)
  Object.entries(attrs).forEach(([k, v]) => {
    setAttribute(el, k, v as any)
  })
  return el
}

describe('squashImportNodes', () => {
  test('collects simple kubb-import nodes', () => {
    const root = createNode('kubb-root')

    const imp = kubbElement('kubb-import', { name: 'React', path: 'react' } satisfies KubbFile.Import)
    appendChildNode(root, imp)

    const result = squashImportNodes(root)

    expect([...result]).toMatchInlineSnapshot(`
      [
        {
          "name": "React",
          "path": "react",
        },
      ]
    `)
  })

  test('collects nested kubb-import nodes inside kubb-text and kubb-file', () => {
    const root = createNode('kubb-root')
    const file = kubbElement('kubb-file', { baseName: 'index.ts', path: '/project/src/index.ts' })
    const text = kubbElement('kubb-text')

    const imp1 = kubbElement('kubb-import', { name: ['useState'], path: 'react' } satisfies KubbFile.Import)
    const imp2 = kubbElement('kubb-import', { name: [{ propertyName: 'join' }], path: 'node:path' } satisfies KubbFile.Import)

    appendChildNode(text, imp1)
    appendChildNode(file, text)
    appendChildNode(file, imp2)
    appendChildNode(root, file)

    const result = squashImportNodes(root)

    expect([...result]).toMatchInlineSnapshot(`
      [
        {
          "name": [
            "useState",
          ],
          "path": "react",
        },
        {
          "name": [
            {
              "propertyName": "join",
            },
          ],
          "path": "node:path",
        },
      ]
    `)
  })

  test('ignores regular elements and text nodes', () => {
    const root = createNode('kubb-root')
    const div = kubbElement('div', { id: 'x' })
    appendChildNode(div, createTextNode('hello'))
    appendChildNode(root, div)

    const result = squashImportNodes(root)
    expect(result.size).toBe(0)
  })
})
