import dedent from 'dedent'
import indentString from 'indent-string'

type IndentProps = {
  size?: number
  children?: string
}

/**
 * Indents all content by `size` spaces.
 * Dedents first to normalize, then applies indentation.
 * Collapses consecutive newlines to at most 2 empty lines.
 */
export function Indent({ size = 2, children }: IndentProps): string {
  if (!children) return ''

  // Dedent first to remove common leading whitespace
  const dedented = dedent(children)
  
  // Split into lines and collapse consecutive empty lines (max 2)
  const lines = dedented.split('\n')
  const collapsed: string[] = []
  let consecutiveEmpty = 0

  for (const line of lines) {
    const isEmpty = line.trim() === ''
    
    if (isEmpty) {
      consecutiveEmpty++
      // Keep at most 2 consecutive empty lines
      if (consecutiveEmpty <= 2) {
        collapsed.push('')
      }
    } else {
      consecutiveEmpty = 0
      collapsed.push(line)
    }
  }

  // Join and indent by size
  const joined = collapsed.join('\n')
  return indentString(joined, size)
}
