import path from 'node:path'
import type * as KubbFile from '../KubbFile.ts'
import { TreeNode } from './TreeNode.ts'

describe('TreeNode', () => {
  const files: KubbFile.File[] = [
    {
      path: 'src/test.ts',
      baseName: 'test.ts',
      sources: [],
      meta: {},
    },
    {
      path: 'src/sub/hello.ts',
      baseName: 'hello.ts',
      sources: [],
      meta: {},
    },
    {
      path: 'src/sub/world.ts',
      baseName: 'world.ts',
      sources: [],
      meta: {},
    },
  ]
  const tree = TreeNode.fromFiles(files, 'src/')
  const treeWindows = TreeNode.fromFiles(files, 'src\\')

  test('if schemas folder contains x files and y folders', () => {
    expect(tree).toBeDefined()
    expect(treeWindows).toBeDefined()

    expect(tree).toMatchSnapshot()
  })

  test('if leaves are rendered correctly', () => {
    expect(tree?.leaves.length).toBe(3)

    tree?.leaves.forEach((leave) => {
      if (leave.data.name === 'hello.ts') {
        expect(leave.data.path).toBe(path.join('src/sub', 'hello.ts'))
      }

      if (leave.data.name === 'hello.ts') {
        expect(leave.data.path).toBe(path.join('src/sub', 'hello.ts'))
      }

      if (leave.data.name === 'test.ts') {
        expect(leave.data.path).toBe(path.join('src/test.ts'))
      }
    })
  })
  test('if `find` is executed correctly', () => {
    const helloTS = tree?.leaves.find((leave) => leave.data.name === 'hello.ts')

    expect(tree?.findDeep).toBeDefined()
    expect(tree?.findDeep((item) => item.data === helloTS?.data)?.data.name).toEqual('hello.ts')
  })

  test('if `foreach` is executed correctly', () => {
    const items: TreeNode<{ name: string }>['data'][] = []

    tree?.forEach((treeNode) => {
      items.push(treeNode.data)
    })
    const names = items.map((item) => item.name)

    expect(items.length).toBe(5)
    expect(names).toMatchInlineSnapshot(`
      [
        "src/",
        "test.ts",
        "sub",
        "hello.ts",
        "world.ts",
      ]
    `)
  })

  test('if TreeNode.toGraph renders a graph correctly', () => {
    expect(tree).toBeDefined()

    expect(TreeNode.toGraph(tree!)).toMatchSnapshot()
  })
})
