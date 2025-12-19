import { describe, expect, it } from 'vitest'
import { appendChildNode, createNode, createTextNode, setAttribute } from '../dom.ts'
import { squashTextNodes } from './squashTextNodes.ts'

function kubbElement(name: string, attrs: Record<string, any> = {}) {
  const el = createNode(name)
  Object.entries(attrs).forEach(([k, v]) => {
    setAttribute(el, k, v as any)
  })
  return el
}

describe('squashTextNodes', () => {
  it('should concatenate plain text nodes', () => {
    const text = createNode('kubb-text')
    appendChildNode(text, createTextNode('Hello'))
    appendChildNode(text, createTextNode(' '))
    appendChildNode(text, createTextNode('World'))

    expect(squashTextNodes(text)).toMatchInlineSnapshot(`"Hello World"`)
  })

  it('should print kubb-import and kubb-export nodes using TypeScript printer', () => {
    const text = createNode('kubb-text')

    const imp = kubbElement('kubb-import', { name: 'React', path: 'react' })
    const exp = kubbElement('kubb-export', { path: './hello.ts', isTypeOnly: true })

    appendChildNode(text, imp)
    appendChildNode(text, exp)

    expect(squashTextNodes(text)).toMatchInlineSnapshot(`
      "import React from "react";
      export type * from "./hello.ts";
      "
    `)
  })

  it('should pass through kubb-source content and convert br to newline', () => {
    const text = createNode('kubb-text')
    const source = kubbElement('kubb-source')
    const br = createNode('br')

    appendChildNode(source, createTextNode('a'))
    appendChildNode(text, source)
    appendChildNode(text, br)
    appendChildNode(text, createTextNode('b'))

    expect(squashTextNodes(text)).toMatchInlineSnapshot(`
      "a
      b"
    `)
  })

  it('should serialize regular elements with attributes and nested content', () => {
    const text = createNode('kubb-text')
    const div = kubbElement('div', { id: 'x', count: 5 })
    appendChildNode(div, createTextNode('inner'))
    appendChildNode(text, div)

    expect(squashTextNodes(text)).toMatchInlineSnapshot(`"<div id="x" count={5}>inner</div>"`)
  })
})
