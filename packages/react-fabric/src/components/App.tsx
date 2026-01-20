import { AppContext, NodeTreeContext, provide, RootContext, useContext, useNodeTree } from '@kubb/fabric-core'
import type { KubbElement, KubbNode } from '../types.ts'

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
export function App<TMeta extends object = object>({ children, ...props }: AppProps<TMeta>): KubbElement {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  tree.data.props = { meta }

  provide(AppContext, { exit, meta })
  provide(FileCollectorContext, fileCollector)
  provide(NodeTreeContext, tree)

  return <>{children}</>
}

App.displayName = 'KubbApp'
