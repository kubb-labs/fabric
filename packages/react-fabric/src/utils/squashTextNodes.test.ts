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

  it('should render kubb-function element as a TypeScript function', () => {
    const root = createNode('kubb-root')
    const fn = kubbElement('kubb-function', { name: 'myFunc' })
    appendChildNode(fn, createTextNode('return true'))
    appendChildNode(root, fn)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`
      "function myFunc() {
        return true
      }"
    `)
  })

  it('should render exported kubb-function with return type', () => {
    const root = createNode('kubb-root')
    const fn = kubbElement('kubb-function', { name: 'getUser', export: true, returnType: 'User' })
    appendChildNode(fn, createTextNode('return fetch("/users")'))
    appendChildNode(root, fn)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`
      "export function getUser(): User {
        return fetch("/users")
      }"
    `)
  })

  it('should render async kubb-function with Promise return type', () => {
    const root = createNode('kubb-root')
    const fn = kubbElement('kubb-function', { name: 'fetchData', async: true, returnType: 'string' })
    appendChildNode(fn, createTextNode('return ""'))
    appendChildNode(root, fn)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`
      "async function fetchData(): Promise<string> {
        return ""
      }"
    `)
  })

  it('should render kubb-const element as a TypeScript const', () => {
    const root = createNode('kubb-root')
    const constEl = kubbElement('kubb-const', { name: 'myVar' })
    appendChildNode(constEl, createTextNode('"hello"'))
    appendChildNode(root, constEl)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`"const myVar = "hello""`)
  })

  it('should render exported kubb-const with type annotation', () => {
    const root = createNode('kubb-root')
    const constEl = kubbElement('kubb-const', { name: 'API_URL', type: 'string', export: true })
    appendChildNode(constEl, createTextNode('"https://api.example.com"'))
    appendChildNode(root, constEl)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`"export const API_URL:string = "https://api.example.com""`)
  })

  it('should render kubb-const with asConst', () => {
    const root = createNode('kubb-root')
    const constEl = kubbElement('kubb-const', { name: 'myVar', asConst: true })
    appendChildNode(constEl, createTextNode('"hello"'))
    appendChildNode(root, constEl)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`"const myVar = "hello" as const"`)
  })

  it('should render kubb-type element as a TypeScript type', () => {
    const root = createNode('kubb-root')
    const typeEl = kubbElement('kubb-type', { name: 'MyType' })
    appendChildNode(typeEl, createTextNode('{ a: string }'))
    appendChildNode(root, typeEl)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`"type MyType = { a: string }"`)
  })

  it('should render exported kubb-type', () => {
    const root = createNode('kubb-root')
    const typeEl = kubbElement('kubb-type', { name: 'User', export: true })
    appendChildNode(typeEl, createTextNode('{ id: number; name: string }'))
    appendChildNode(root, typeEl)

    expect(squashTextNodes(root)).toMatchInlineSnapshot(`"export type User = { id: number; name: string }"`)
  })
})
