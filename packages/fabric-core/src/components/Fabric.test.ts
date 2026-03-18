import { afterEach, describe, expect, it } from 'vitest'
import { inject, unprovide } from '../context.ts'
import { FabricContext } from '../contexts/FabricContext.ts'
import { createComponent } from '../createComponent.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { Fabric } from './Fabric.ts'

describe('Fabric', () => {
  afterEach(() => {
    unprovide(FabricContext)
  })

  it('should return children when provided', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const children = 'const x = 1'
    const component = Fabric().children([children])

    const output = await fabric.render(component)

    expect(output).toBe(children)
  })

  it('should return fsx children when provided with children helper', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Const = createComponent('Const', () => {
      return 'const x = 1'
    })

    const component = Fabric().children([Const(), Const()])

    const output = await fabric.render(component)

    expect(output).toMatchInlineSnapshot(`"const x = 1const x = 1"`)
  })

  it('should return fsx children when provided with children prop', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Const = createComponent('Const', () => {
      return 'const x = 1'
    })

    const component = Fabric({
      children: [Const(), Const()],
    })

    const output = await fabric.render(component)

    expect(output).toMatchInlineSnapshot(`"const x = 1const x = 1"`)
  })

  it('should handle undefined children', () => {
    const output = Fabric({ meta: { test: true } })()
    expect(output).toBe('')
  })

  it('should inject meta data', () => {
    const Text = createComponent('Text', () => {
      const ctx = inject(FabricContext)
      return JSON.stringify(ctx?.meta)
    })

    const output = Fabric({
      meta: { version: '1.0.0', author: 'test' },
    }).children(Text())

    expect(output()).toMatchInlineSnapshot(`"{"version":"1.0.0","author":"test"}"`)
  })
})
