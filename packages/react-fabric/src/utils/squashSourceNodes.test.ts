import { describe, expect, it } from 'vitest'
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
  it('should extract sources with trimmed value', () => {
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
          "isTypeOnly": false,
          "name": "x",
          "value": "export const x = 1",
        },
      ]
    `)
  })

  it('should collect AST nodes from kubb-function elements inside kubb-source', () => {
    const root = createNode('kubb-root')
    const src = kubbElement('kubb-source', { name: 'getUser', isExportable: true })

    const fn = kubbElement('kubb-function', { name: 'getUser', export: true, returnType: 'User' })
    appendChildNode(fn, createTextNode('return fetch("/users")'))
    appendChildNode(src, fn)
    appendChildNode(root, src)

    const result = squashSourceNodes(root, ['kubb-export', 'kubb-import'])
    const sources = [...result]

    expect(sources).toHaveLength(1)
    expect(sources[0]!.nodes).toBeDefined()
    expect(sources[0]!.nodes).toHaveLength(1)
    // nodes should be TypeScript AST nodes (ts.FunctionDeclaration)
    const node = sources[0]!.nodes![0]!
    expect(node).toHaveProperty('kind')
  })

  it('should collect AST nodes from kubb-const elements inside kubb-source', () => {
    const root = createNode('kubb-root')
    const src = kubbElement('kubb-source', { name: 'API_URL' })

    const constEl = kubbElement('kubb-const', { name: 'API_URL', type: 'string', export: true })
    appendChildNode(constEl, createTextNode('"https://api.example.com"'))
    appendChildNode(src, constEl)
    appendChildNode(root, src)

    const result = squashSourceNodes(root, ['kubb-export', 'kubb-import'])
    const sources = [...result]

    expect(sources).toHaveLength(1)
    expect(sources[0]!.nodes).toBeDefined()
    expect(sources[0]!.nodes).toHaveLength(1)
  })

  it('should collect AST nodes from kubb-type elements inside kubb-source', () => {
    const root = createNode('kubb-root')
    const src = kubbElement('kubb-source', { name: 'User' })

    const typeEl = kubbElement('kubb-type', { name: 'User', export: true })
    appendChildNode(typeEl, createTextNode('{ id: number; name: string }'))
    appendChildNode(src, typeEl)
    appendChildNode(root, src)

    const result = squashSourceNodes(root, ['kubb-export', 'kubb-import'])
    const sources = [...result]

    expect(sources).toHaveLength(1)
    expect(sources[0]!.nodes).toBeDefined()
    expect(sources[0]!.nodes).toHaveLength(1)
  })

  it('should not add nodes field when source has no function/const/type elements', () => {
    const root = createNode('kubb-root')
    const src = kubbElement('kubb-source', { name: 'plain' })
    appendChildNode(src, createTextNode('const x = 1'))
    appendChildNode(root, src)

    const result = squashSourceNodes(root, [])
    const sources = [...result]

    expect(sources).toHaveLength(1)
    expect(sources[0]).not.toHaveProperty('nodes')
  })
})
