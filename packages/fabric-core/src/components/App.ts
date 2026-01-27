import { useContext } from '../composables/useContext.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'

export type AppProps<TMeta extends Object = Object> = {
  /**
   * Metadata attached to the App context.
   *
   * Use this to pass custom data to child components via useApp.
   */
  meta?: TMeta
  /**
   * Child components.
   */
  children?: FabricNode
}

/**
 * Container component providing App context with metadata and lifecycle.
 *
 * Use this component to wrap your application and provide shared metadata
 * that can be accessed by child components using the useApp composable.
 *
 * @example
 * ```tsx
 * <App meta={{ version: '1.0.0', author: 'John Doe' }}>
 *   <File baseName="user.ts" path="./user.ts">
 *     <File.Source>export type User = {}</File.Source>
 *   </File>
 * </App>
 * ```
 */
export const App = createComponent('App', ({ children, ...props }: AppProps) => {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'App', props })

    provide(NodeTreeContext, childTree)
  }

  provide(AppContext, { exit, meta })

  return children
})

App.displayName = 'App'
