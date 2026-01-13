import { AppContext, provide, RootContext, useContext } from '@kubb/fabric-core'
import type { KubbNode } from '../types.ts'

type Props<TMeta = unknown> = {
  readonly children?: KubbNode
  readonly meta: TMeta
}

/**
 * Provides the current app context (meta and exit) to descendants.
 * This component mirrors the Fabric app container in React.
 */
export function App<TMeta = unknown>({ meta, children }: Props<TMeta>) {
  const { exit } = useContext(RootContext)
  provide(AppContext, { exit, meta })

  return children
}

App.displayName = 'KubbApp'
