import dedent from 'dedent'
import indentString from 'indent-string'

type IndentProps = {
  size?: number
  children?: string
}

/**
 * Indents all content by `size` spaces.
 * Collapses consecutive newlines to at most 2.
 */
export function Indent({ size = 2, children }: IndentProps): string {
  if (!children) return ''

  // First, collapse consecutive newlines (keep max 2 empty lines)
  const lines = children.split('\n')
  const result: string[] = []
  let consecutiveEmpty = 0

  for (const line of lines) {
    if (line.trim() === '') {
      consecutiveEmpty++
      if (consecutiveEmpty <= 2) {
        result.push('')
      }
    } else {
      consecutiveEmpty = 0
      result.push(line)
    }
  }

  // Then dedent and indent
  const collapsed = result.join('\n')
  const cleaned = dedent(collapsed)
  return indentString(cleaned, size)
}
