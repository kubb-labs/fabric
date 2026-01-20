import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { unprovide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { TreeNode } from '../utils/TreeNode.ts'
import { App } from './App.ts'
import { Function } from './Function.ts'

describe('Function', () => {
  afterEach(() => {
    unprovide(AppContext)
  })

  const scenarios: Array<{ name: string; props: any }> = [
    { name: 'basic function', props: { name: 'myFunc', children: 'return true' } },
    { name: 'exported function', props: { name: 'myFunc', export: true, children: 'return true' } },
    { name: 'function with parameters', props: { name: 'myFunc', params: 'a: string, b: number', children: 'return true' } },
    { name: 'async function', props: { name: 'myFunc', async: true, children: 'return true' } },
    { name: 'function with generics', props: { name: 'myFunc', generics: 'T', children: 'return true' } },
    { name: 'function with return type', props: { name: 'myFunc', returnType: 'boolean', children: 'return true' } },
    { name: 'async function with Promise return type', props: { name: 'myFunc', async: true, returnType: 'boolean', children: 'return true' } },
    { name: 'function with JSDoc', props: { name: 'myFunc', JSDoc: { comments: ['@deprecated'] }, children: 'return true' } },
    { name: 'default exported function', props: { name: 'myFunc', export: true, default: true, children: 'return true' } },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Function(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode({ type: 'root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const component = App({
      children: Function({ name: 'myFunc', children: 'return true' }),
    })

    const output = await fabric.render(component)

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    expect(result).toMatchInlineSnapshot(`
      "function myFunc(a: string, b: number) {
        return true
      }"
    `)
  })

  it('should create an async function', () => {
    const result = Function({ name: 'myFunc', async: true, children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "async function myFunc() {
        return true
      }"
    `)
  })

  it('should create a function with generics', () => {
    const result = Function({ name: 'myFunc', generics: 'T', children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "function myFunc<T>() {
        return true
      }"
    `)
  })

  it('should create a function with return type', () => {
    const result = Function({ name: 'myFunc', returnType: 'boolean', children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "function myFunc(): boolean {
        return true
      }"
    `)
  })

  it('should create an async function with Promise return type', () => {
    const result = Function({ name: 'myFunc', async: true, returnType: 'boolean', children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "async function myFunc(): Promise<boolean> {
        return true
      }"
    `)
  })

  it('should create a function with JSDoc', () => {
    const result = Function({ name: 'myFunc', JSDoc: { comments: ['@deprecated'] }, children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "/**
       * @deprecated
       */
      function myFunc() {
        return true
      }"
    `)
  })

  it('should create a default exported function', () => {
    const result = Function({ name: 'myFunc', export: true, default: true, children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "export default function myFunc() {
        return true
      }"
    `)
  })

  it('should create a function with multiple parameters', () => {
    const result = Function({ name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' })

    expect(result).toMatchInlineSnapshot(`
      "function getData<TData>(): number {
        return 2
      }"
    `)
  })
})

describe('Function.Arrow', () => {
  it('should create a basic arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', children: 'return true' })

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Function.Arrow(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode({ type: 'root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const component = App({
      children: Function.Arrow({ name: 'myFunc', children: 'return true' }),
    })

    const output = await fabric.render(component)

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    expect(result).toMatchInlineSnapshot(`
      "export const myFunc = () => {
        return true
      }"
    `)
  })

  it('should create an async arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', async: true, children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "const myFunc = async () => {
        return true
      }"
    `)
  })

  it('should create an arrow function with generics', () => {
    const result = Function.Arrow({ name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' })

    expect(result).toMatchInlineSnapshot(`
      "const getData = <TData>(): number => {
        return 2
      }"
    `)
  })

  it('should create a default exported arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', export: true, default: true, children: 'return true' })

    expect(result).toMatchInlineSnapshot(`
      "export default const myFunc = () => {
        return true
      }"
    `)
  })
})
