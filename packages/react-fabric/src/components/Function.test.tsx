import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Function } from './Function.tsx'

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

    expect(output).toMatchInlineSnapshot(`
      "export async function getData() {
        return 2;
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

    expect(output).toMatchInlineSnapshot(`
      "export default async function getData() {
        return 2;
      }"
    `)
  })

  it('render Function with comments', async () => {
    const Component = () => {
      return (
        <Function name="getData" export async JSDoc={{ comments: ['@deprecated'] }}>
          return 2;
        </Function>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "/**
       * @deprecated
       */
      export async function getData() {
        return 2;
      }"
    `)
  })

  it('render ArrowFunction', async () => {
    const Component = () => {
      return (
        <Function.Arrow name="getData" export async>
          return 2;
        </Function.Arrow>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export const getData = async () => {
        return 2;
      }
      "
    `)
  })

  it('render default ArrowFunction', async () => {
    const Component = () => {
      return (
        <Function.Arrow name="getData" export async default>
          return 2;
        </Function.Arrow>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export default const getData = async () => {
        return 2;
      }
      "
    `)
  })

  it('render Function Generics', async () => {
    const Component = () => {
      return (
        <Function name="getData" export async generics={['TData']} returnType="number">
          return 2;
        </Function>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export async function getData<TData>(): Promise<number> {
        return 2;
      }"
    `)
  })

  it('render ArrowFunction Generics', async () => {
    const Component = () => {
      return (
        <Function.Arrow name="getData" export async generics={['TData']} returnType="number">
          return 2;
        </Function.Arrow>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export const getData = async <TData>(): Promise<number> => {
        return 2;
      }
      "
    `)
  })

  it('render ArrowFunction SingleLine', async () => {
    const Component = () => {
      return (
        <Function.Arrow name="getData" export async generics={['TData']} singleLine returnType="number">
          2;
        </Function.Arrow>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export const getData = async <TData>(): Promise<number> => 2;
      "
    `)
  })

  it('render multiple functions', async () => {
    const Component = () => {
      return (
        <>
          <Function name="getData" export async generics={['TData']} returnType="number">
            2;
          </Function>

          <Function name="getData" export async generics={['TData']} returnType="number">
            3;
          </Function>
        </>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export async function getData<TData>(): Promise<number> {
        2;
      }export async function getData<TData>(): Promise<number> {
        3;
      }"
    `)
  })

  it('render Function with params', async () => {
    const Component = () => {
      return (
        <Function name="myFunc" params="a: string, b: number">
          return true;
        </Function>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toContain('function myFunc(a: string, b: number)')
  })

  it('render Function with returnType', async () => {
    const Component = () => {
      return (
        <Function name="myFunc" returnType="boolean">
          return true;
        </Function>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toContain('function myFunc(): boolean')
  })
})
