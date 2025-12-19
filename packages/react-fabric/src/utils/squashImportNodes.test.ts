import type { KubbFile } from '@kubb/fabric-core/types'
import { describe, expect, test } from 'vitest'
import { appendChildNode, createNode, createTextNode, setAttribute } from '../dom.ts'
import { squashImportNodes } from './squashImportNodes.ts'

function kubbElement(name: string, attrs: Record<string, any> = {}) {
  const el = createNode(name)
  Object.entries(attrs).forEach(([k, v]) => {
    setAttribute(el, k, v as any)
  })
  return el
}

describe('squashImportNodes', () => {
  test('should collect simple kubb-import nodes', () => {
    const root = createNode('kubb-root')

    const imp = kubbElement('kubb-import', { name: 'React', path: 'react' } satisfies KubbFile.Import)
    appendChildNode(root, imp)

    const result = squashImportNodes(root)

    expect([...result]).toMatchInlineSnapshot(`
      [
        {
          "isNameSpace": false,
          "isTypeOnly": false,
          "name": "React",
          "path": "react",
          "root": undefined,
        },
      ]
    `)
  })

  test('should collect nested kubb-import nodes inside kubb-text and kubb-file', () => {
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
          "isNameSpace": false,
          "isTypeOnly": false,
          "name": [
            "useState",
          ],
          "path": "react",
          "root": undefined,
        },
        {
          "isNameSpace": false,
          "isTypeOnly": false,
          "name": [
            {
              "propertyName": "join",
            },
          ],
          "path": "node:path",
          "root": undefined,
        },
      ]
    `)
  })

  test('should ignore regular elements and text nodes', () => {
    const root = createNode('kubb-root')
    const div = kubbElement('div', { id: 'x' })
    appendChildNode(div, createTextNode('hello'))
    appendChildNode(root, div)

    const result = squashImportNodes(root)
    expect(result.size).toBe(0)
  })
})
