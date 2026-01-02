import dedent from 'dedent'
import indentString from 'indent-string'

type IndentProps = {
  size?: number
  children?: string
}

/**
 * Indents all content by `size` spaces.
 * Dedents first to normalize whitespace, preserving relative indentation,
 * then applies the specified indentation to all lines.
 */
export function Indent({ size = 2, children }: IndentProps): string {
  if (!children) return ''

  // Dedent first to remove common leading whitespace
  const cleaned = dedent(children)
  
  // Apply indentation to all lines
  return indentString(cleaned, size)
}
