import { useContext } from '../composables/useContext.ts'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import { Text } from './Text.ts'

export type AppProps<TMeta extends Object = Object> = {
  /**
   * Metadata associated with the App.
   */
  meta?: TMeta
  /**
   * Children nodes.
   */
  children?: FabricNode
}

/**
 * Minimal fsx app container — provides an AppContext carrying `meta` and an
 * `exit` hook. In fsx mode this just returns children content.
 */
export const App = createComponent(({ children, ...props }: AppProps) => {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  tree.data.props = { meta }

  provide(AppContext, { exit, meta })
  provide(FileCollectorContext, fileCollector)
  provide(NodeTreeContext, tree)

  return Text({ children })
})

App.displayName = 'KubbApp'
