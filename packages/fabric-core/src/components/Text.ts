type Props = {
  /**
   * Children nodes.
   */
  children?: string | (() => string | Array<string>)
}

/**
 * Generates a text node from string or function returning string/array of strings.
 */
export function Text({ children }: Props): string {
  if (!children) {
    return ''
  }

  if (typeof children === 'string') {
    return children
  }

  const value = children()

  if (Array.isArray(value)) {
    return value.join('\n')
  }

  return value
}
