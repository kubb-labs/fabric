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

  // Split content by lines
  const lines = children.split('\n')
  const result: string[] = []

  let consecutiveEmpty = 0

  for (const line of lines) {
    if (line.trim() === '') {
      consecutiveEmpty++
      if (consecutiveEmpty <= 2) {
        result.push(line)
      }
    } else {
      consecutiveEmpty = 0
      result.push(line)
    }
  }

  const cleaned = dedent(result.join('\n'))
  return indentString(cleaned, size)
}
