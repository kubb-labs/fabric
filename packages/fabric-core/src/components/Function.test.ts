import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { FileManager } from '../FileManager.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { App } from './App.ts'
import { Function } from './Function.ts'
import { Root } from './Root.ts'

describe('Function', () => {
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
    const output = Function(props)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const output = Root({
      treeNode,
      fileManager: new FileManager(),
      onError: vi.fn(),
      onExit: vi.fn(),
      children: () => {
        return App({
          children: () => Function({ name: 'myFunc', children: 'return true' }),
        })
      },
    })

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const functionChild = appChild.children[0]!

    expect(functionChild.data.type).toBe('Function')
    expect(functionChild.data.props).toMatchObject({ name: 'myFunc' })

    expect(output).toMatchInlineSnapshot(`"function myFunc() { \nreturn true \n}"`)
  })
})

describe('Function.Arrow', () => {
  const scenarios: Array<{ name: string; props: any }> = [
    { name: 'basic arrow function', props: { name: 'myFunc', children: 'return true' } },
    { name: 'single line arrow function', props: { name: 'myFunc', singleLine: true, children: 'true' } },
    { name: 'exported arrow function', props: { name: 'myFunc', export: true, children: 'return true' } },
    { name: 'async arrow function', props: { name: 'myFunc', async: true, children: 'return true' } },
    { name: 'arrow function with generics', props: { name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' } },
    { name: 'default exported arrow function', props: { name: 'myFunc', export: true, default: true, children: 'return true' } },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Function.Arrow(props)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const output = Root({
      treeNode,
      fileManager: new FileManager(),
      onError: vi.fn(),
      onExit: vi.fn(),
      children: () => {
        return App({
          children: () => Function.Arrow({ name: 'myFunc', children: 'return true' }),
        })
      },
    })

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const functionChild = appChild.children[0]!

    expect(functionChild.data.type).toBe('ArrowFunction')
    expect(functionChild.data.props).toMatchObject({ name: 'myFunc' })

    expect(output).toMatchInlineSnapshot(`"const myFunc = () => { \nreturn true \n}\n"`)
  })
})
