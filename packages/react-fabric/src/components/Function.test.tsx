import path from 'node:path'
import { FileManager, TreeNode } from '@kubb/fabric-core'
import { describe, expect, it, vi } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import { App } from './App.tsx'
import { Function } from './Function.tsx'
import { Root } from './Root.tsx'

describe('<Function/>', () => {
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
    { name: 'exported async function with generics', props: { name: 'getData', export: true, async: true, generics: 'TData', returnType: 'number', children: 'return 2' } },
  ]

  it.each(scenarios)('should render $name', async ({ name, props }) => {
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Function {...(props as any)}>{(props as any).children}</Function>)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <Root treeNode={treeNode} fileManager={new FileManager()} onExit={vi.fn()} onError={vi.fn()}>
        <App>
          <Function name={'myFunc'}>return true;</Function>
        </App>
      </Root>,
    )

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const functionChild = appChild.children[0]!

    expect(functionChild.data.type).toBe('Function')
    expect(functionChild.data.props).toMatchObject({ name: 'myFunc' })

    expect(output).toMatchInlineSnapshot(`
      "function myFunc() {
        return true;
      }"
    `)
  })
})

describe('<Function.Arrow/>', () => {
  const scenarios: Array<{ name: string; props: any }> = [
    { name: 'basic arrow function', props: { name: 'myFunc', children: 'return true' } },
    { name: 'single line arrow function', props: { name: 'myFunc', singleLine: true, children: 'true' } },
    { name: 'exported arrow function', props: { name: 'myFunc', export: true, children: 'return true' } },
    { name: 'async arrow function', props: { name: 'myFunc', async: true, children: 'return true' } },
    { name: 'arrow function with generics', props: { name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' } },
    { name: 'default exported arrow function', props: { name: 'myFunc', export: true, default: true, children: 'return true' } },
    { name: 'exported async arrow function with generics', props: { name: 'getData', export: true, async: true, generics: 'TData', returnType: 'number', children: 'return 2' } },
  ]

  it.each(scenarios)('should render $name', async ({ name, props }) => {
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Function.Arrow {...(props as any)}>{(props as any).children}</Function.Arrow>)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <Root treeNode={treeNode} fileManager={new FileManager()} onExit={vi.fn()} onError={vi.fn()}>
        <App>
          <Function.Arrow name={'myFunc'}>return true;</Function.Arrow>
        </App>
      </Root>,
    )

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const functionChild = appChild.children[0]!

    expect(functionChild.data.type).toBe('ArrowFunction')
    expect(functionChild.data.props).toMatchObject({ name: 'myFunc' })

    expect(output).toMatchInlineSnapshot(`
      "const myFunc = () => {
        return true;
      }
      "
    `)
  })
})
