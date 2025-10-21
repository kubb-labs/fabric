import { describe, test, expect } from 'vitest'
import { createNode, appendChildNode, setAttribute } from '../dom.ts'
import { squashExportNodes } from './squashExportNodes.ts'
import type { KubbFile } from '@kubb/fabric-core/types'

function kubbElement(name: string, attrs: Record<string, any> = {}) {
  const el = createNode(name)
  Object.entries(attrs).forEach(([k, v]) => {
    setAttribute(el, k, v as any)
  })
  return el
}

describe('squashExportNodes', () => {
  test('collects simple re-export (export * from path)', () => {
    const root = createNode('kubb-root')

    const exp = kubbElement('kubb-export', { path: './hello.ts' } satisfies KubbFile.Export)
    appendChildNode(root, exp)

    const result = squashExportNodes(root)

    expect([...result]).toMatchInlineSnapshot(`
      [
        {
          "path": "./hello.ts",
        },
      ]
    `)
  })

  test('collects nested kubb-export with names and asAlias', () => {
    const root = createNode('kubb-root')
    const file = kubbElement('kubb-file', { baseName: 'index.ts', path: '/project/src/index.ts' })
    const text = kubbElement('kubb-text')

    const exp1 = kubbElement('kubb-export', { name: ['alpha', 'beta'], asAlias: true, path: './names.ts' } satisfies KubbFile.Export)
    const exp2 = kubbElement('kubb-export', { name: 'ns', asAlias: true, path: './mod.ts' } satisfies KubbFile.Export)

    appendChildNode(text, exp1)
    appendChildNode(file, text)
    appendChildNode(file, exp2)
    appendChildNode(root, file)

    const result = squashExportNodes(root)

    expect([...result]).toMatchInlineSnapshot(`
      [
        {
          "asAlias": true,
          "name": [
            "alpha",
            "beta",
          ],
          "path": "./names.ts",
        },
        {
          "asAlias": true,
          "name": "ns",
          "path": "./mod.ts",
        },
      ]
    `)
  })

  test('ignores regular elements', () => {
    const root = createNode('kubb-root')
    const div = kubbElement('div', { id: 'x' })
    appendChildNode(root, div)

    const result = squashExportNodes(root)
    expect(result.size).toBe(0)
  })
})
