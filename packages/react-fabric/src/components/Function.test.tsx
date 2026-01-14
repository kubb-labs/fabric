import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Function } from './Function.tsx'

describe('<Function/>', () => {
  it('render Function', async () => {
    const Component = () => {
      return (
        <Function name="getData" export async>
          return 2;
        </Function>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export async function getData() {
        return 2;
      }"
    `)
  })

  it('render default Function', async () => {
    const Component = () => {
      return (
        <Function name="getData" export async default>
          return 2;
        </Function>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

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
