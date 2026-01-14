import { AppContext, FileCollector, FileCollectorContext, NodeTreeContext, provide, RootContext, TreeNode, useContext } from '@kubb/fabric-core'
import type { ComponentNode, KubbNode } from '../types.ts'

type Props<TMeta = unknown> = {
  readonly meta: TMeta
  readonly tree?: TreeNode<ComponentNode>
  readonly fileCollector?: FileCollector
  readonly children?: KubbNode
}

/**
 * Provides the current app context (meta and exit) to descendants.
 * This component mirrors the Fabric app container in React.
 */
export function App<TMeta = unknown>({
  meta,
  fileCollector = new FileCollector(),
  tree = new TreeNode<ComponentNode>({ type: 'App', props: { meta } }),
  children,
}: Props<TMeta>) {
  const { exit } = useContext(RootContext)

  tree.data.props = { meta }

  provide(AppContext, { exit, meta })
  provide(FileCollectorContext, fileCollector)
  provide(NodeTreeContext, tree)

  return children
}

App.displayName = 'KubbApp'
