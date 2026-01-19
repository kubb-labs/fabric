import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { FileManager } from '../FileManager.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { App } from './App.ts'
import { Root } from './Root.ts'
import { Type, type TypeProps } from './Type.ts'

describe('Type', () => {
  const scenarios: Array<{ name: string; props: TypeProps }> = [
    {
      name: 'basic type',
      props: { name: 'MyType', children: '{ a: string }' },
    },
    {
      name: 'exported type',
      props: { name: 'MyType', export: true, children: '{ a: string }' },
    },
    {
      name: 'type with JSDoc',
      props: { name: 'MyType', JSDoc: { comments: ['This is a variable'] }, children: '{ a: string }' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Type(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should throw error if name does not start with capital letter', () => {
    expect(() => {
      Type({ name: 'myType', children: 'string' })()
    }).toThrow('Name should start with a capital letter')
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
          children: () => Type({ name: 'MyType', children: '{ a: string }' })(),
        })()
      },
    })()

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const typeChild = appChild.children[0]!

    expect(typeChild.data.type).toBe('Type')
    expect(typeChild.data.props).toMatchObject({
      name: 'MyType',
    })

    expect(output).toMatchInlineSnapshot(`"type MyType = { a: string }"`)
  })
})
