import { useContext } from '../composables/useContext.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { Text } from './Text.ts'

export type AppProps<TMeta extends Object = Object> = {
  /**
   * Metadata associated with the App.
   */
  meta?: TMeta
  /**
   * Children nodes.
   */
  children?: string | (() => string | Array<string>)
}

/**
 * App container containing the AppContext carrying `meta` and an `exit` hook.
 */
export function App<TMeta extends Object = Object>({ children, ...props }: AppProps<TMeta>): string {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'App', props })

    provide(NodeTreeContext, childTree)
  }

  provide(AppContext, { exit, meta })

  return Text({ children })
}

App.displayName = 'KubbApp'
