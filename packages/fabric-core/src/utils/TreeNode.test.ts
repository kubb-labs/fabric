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

  it('should create tree structure with correct number of files and folders', () => {
    expect(tree).toBeDefined()
    expect(treeWindows).toBeDefined()

    expect(tree).toMatchSnapshot()
  })

  it('should render leaves correctly with proper paths', () => {
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
  it('should execute findDeep correctly to locate specific nodes', () => {
    const helloTS = tree?.leaves.find((leave) => leave.data.name === 'hello.ts')

    expect(tree?.findDeep).toBeDefined()
    expect(tree?.findDeep((item) => item.data === helloTS?.data)?.data.name).toEqual('hello.ts')
  })

  it('should execute forEach correctly and iterate over all nodes', () => {
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

  it('should render graph correctly using TreeNode.toGraph', () => {
    expect(tree).toBeDefined()

    expect(TreeNode.toGraph(tree!)).toMatchSnapshot()
  })
})
