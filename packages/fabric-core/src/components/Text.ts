import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'

type Props = {
  /**
   * Children nodes.
   */
  children?: FabricNode
}

/**
 * Generates a text node from string or function returning string/array of strings.
 */
export const Text = createComponent(({ children }: Props) => {
  return children
})
