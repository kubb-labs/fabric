import { useContext } from '../composables/useContext.ts'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { FileCollector } from '../utils/FileCollector.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { Text } from './Text.ts'

type Props<TMeta = unknown> = {
  readonly meta?: TMeta
  readonly tree?: TreeNode<ComponentNode>
  readonly fileCollector?: FileCollector
  readonly children?: string | (() => string | Array<string>)
}

/**
 * Minimal fsx app container — provides an AppContext carrying `meta` and an
 * `exit` hook. In fsx mode this just returns children content.
 */
export function App<TMeta = unknown>({
  meta,
  fileCollector = new FileCollector(),
  tree = new TreeNode<ComponentNode>({ type: 'App', props: { meta } }),
  children,
}: Props<TMeta>): string {
  const { exit } = useContext(RootContext)

  tree.data.props = { meta }

  provide(AppContext, { exit, meta })
  provide(FileCollectorContext, fileCollector)
  provide(NodeTreeContext, tree)

  return Text({ children })
}

App.displayName = 'KubbApp'
