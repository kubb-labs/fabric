import { afterEach, describe, expect, it } from 'vitest'
import { inject, unprovide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { createComponent } from '../createComponent.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { App } from './App.ts'

describe('App', () => {
  afterEach(() => {
    unprovide(AppContext)
  })

  it('should return children when provided', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const children = 'const x = 1'
    const component = App().children([children])

    const output = await fabric.render(component)

    expect(output).toBe(children)
  })

  it('should return fsx children when provided with children helper', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Const = createComponent('Const', () => {
      return 'const x = 1'
    })

    const component = App().children([Const(), Const()])

    const output = await fabric.render(component)

    expect(output).toMatchInlineSnapshot(`"const x = 1const x = 1"`)
  })

  it('should return fsx children when provided with children prop', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Const = createComponent('Const', () => {
      return 'const x = 1'
    })

    const component = App({
      children: [Const(), Const()],
    })

    const output = await fabric.render(component)

    expect(output).toMatchInlineSnapshot(`"const x = 1const x = 1"`)
  })

  it('should handle undefined children', () => {
    const output = App({ meta: { test: true } })()
    expect(output).toBe('')
  })

  it('should inject meta data', () => {
    const Text = createComponent('Text', () => {
      const ctx = inject(AppContext)
      return JSON.stringify(ctx?.meta)
    })

    const output = App({
      meta: { version: '1.0.0', author: 'test' },
    }).children(Text())

    expect(output()).toMatchInlineSnapshot(`"{"version":"1.0.0","author":"test"}"`)
  })
})
