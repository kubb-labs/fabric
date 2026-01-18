import type { FabricNode } from '../Fabric.ts'

type Props = {
  /**
   * Children nodes.
   */
  children?: FabricNode
}

function transform(children: FabricNode): string {
  if (!children) {
    return ''
  }

  if (typeof children === 'function') {
    return transform(children())
  }

  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'number') {
    return `${children}`
  }

  if (typeof children === 'boolean') {
    return `${children}`
  }

  if (Array.isArray(children)) {
    return children.join('\n')
  }

  return children
}

/**
 * Generates a text node from string or function returning string/array of strings.
 */
export function Text({ children }: Props): string {
  return transform(children)
}
