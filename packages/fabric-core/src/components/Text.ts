import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'

type Props = {
  /**
   * Children nodes.
   */
  children?: FabricNode
}

/**
 * Generates a text node from string
 */
export const Text = createComponent('Text', ({ children }: Props) => {
  return children
})
