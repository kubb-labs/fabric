type Props = {
  readonly children?: string | (() => string | Array<string>)
}

export function Text({ children }: Props): string {
  if (!children) {
    return ''
  }

  if (typeof children === 'string') {
    return children
  }

  const value = children()

  if (Array.isArray(value)) {
    return value.join('')
  }

  return value
}
