import { afterEach, describe, expect, it } from 'vitest'
import { unprovide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { createComponent } from '../createComponent.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { App } from './App.ts'

describe('App', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(AppContext)
  })

  it('should return children when provided', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const children = 'const x = 1'
    const component = App().children([children])

    const output = await fabric.render(component)

  it('should return children when provided', () => {
    const children = 'const x = 1;\nconst y = 2;'
    const result = App({ meta: {}, children })
    expect(result).toBe(children)
  })

  it('should have displayName', () => {
    expect(App.displayName).toBe('KubbApp')
  })

  it('should work with typed meta', () => {
    type Meta = { version: string; author: string }
    const meta: Meta = { version: '1.0.0', author: 'test' }
    const result = App<Meta>({ meta, children: 'code here' })
    expect(result).toBe('code here')
  })

  it('should return fsx children when provided with children helper', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Const = createComponent(() => {
      return 'const x = 1'
    })

    const component = App().children([Const(), Const()])

    const output = await fabric.render(component)

    expect(output).toMatchInlineSnapshot(`"const x = 1const x = 1"`)
  })

  it('should return fsx children when provided with children prop', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Const = createComponent(() => {
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
    const Text = createComponent(() => {
      const ctx = inject(AppContext)
      console.log('Test Text ctx:', ctx)
      return JSON.stringify(ctx?.meta)
    })

    const output = App({
      meta: { version: '1.0.0', author: 'test' },
    }).children(Text())

    expect(output()).toMatchInlineSnapshot(`"{"version":"1.0.0","author":"test"}"`)
  })
})
