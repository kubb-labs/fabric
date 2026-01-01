import { createFabric, createRefKey } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { VarDeclaration } from './VarDeclaration.tsx'

describe('<VarDeclaration/>', () => {
  test('should render a const declaration', async () => {
    const Component = () => {
      return <VarDeclaration name="foo">"hello world"</VarDeclaration>
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"const foo = "hello world""`)
  })

  test('should render an exported const', async () => {
    const Component = () => {
      return (
        <VarDeclaration name="foo" export>
          "hello world"
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"export const foo = "hello world""`)
  })

  test('should render with type annotation', async () => {
    const Component = () => {
      return (
        <VarDeclaration name="foo" type="string">
          "hello world"
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"const foo: string = "hello world""`)
  })

  test('should render with let keyword', async () => {
    const Component = () => {
      return (
        <VarDeclaration name="count" kind="let" type="number">
          0
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"let count: number = 0"`)
  })

  test('should render with var keyword', async () => {
    const Component = () => {
      return (
        <VarDeclaration name="oldStyle" kind="var">
          true
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"var oldStyle = true"`)
  })

  test('should render with JSDoc comments', async () => {
    const Component = () => {
      return (
        <VarDeclaration
          name="foo"
          export
          JSDoc={{
            comments: ['A greeting message'],
          }}
        >
          "hello"
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "/**
       * A greeting message
       */
      export const foo = "hello""
    `)
  })

  test('should work with refkey (syntax only)', async () => {
    const refkey = createRefKey()

    const Component = () => {
      return (
        <VarDeclaration name="foo" export refkey={refkey}>
          "hello world"
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    // RefKey is metadata, doesn't affect output
    expect(output).toMatchInlineSnapshot(`"export const foo = "hello world""`)
  })

  test('should render complex value', async () => {
    const Component = () => {
      return (
        <VarDeclaration name="config" type="Config" export>
          {`{
  port: 3000,
  host: 'localhost'
}`}
        </VarDeclaration>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export const config: Config = {
        port: 3000,
        host: 'localhost'
      }"
    `)
  })
})
