import { describe, expect, test } from 'vitest'
import { appendChildNode, createNode, createTextNode, setAttribute } from '../dom.ts'
import { squashSourceNodes } from './squashSourceNodes.ts'

function kubbElement(name: string, attrs: Record<string, any> = {}) {
  const el = createNode(name)
  Object.entries(attrs).forEach(([k, v]) => {
    setAttribute(el, k, v as any)
  })
  return el
}

describe('squashSourceNodes', () => {
  test('extracts sources with trimmed value', () => {
    const root = createNode('kubb-root')
    const file = kubbElement('kubb-file', { baseName: 'index.ts', path: '/project/src/index.ts' })

    const src = kubbElement('kubb-source', { name: 'x', isExportable: true, isIndexable: true })
    // add whitespace and newlines that should be trimmed
    appendChildNode(src, createTextNode('\n  export const x = 1\n'))

    appendChildNode(file, src)
    appendChildNode(root, file)

    const result = squashSourceNodes(root, ['kubb-export', 'kubb-import'])

    expect([...result]).toMatchInlineSnapshot(`
      [
        {
          "isExportable": true,
          "isIndexable": true,
          "name": "x",
          "value": "export const x = 1",
        },
      ]
    `)
  })
})
