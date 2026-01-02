import { describe, expect, test } from 'vitest'
import { Indent } from './Indent.ts'

describe('Indent', () => {
  test('should return empty string when no children', () => {
    const result = Indent({})
    expect(result).toBe('')
  })

  test('should indent content by default 2 spaces', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const result = Indent({ children: content })
    expect(result).toBe('  const x = 1;\n  const y = 2;')
  })

  test('should indent content by specified size', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const result = Indent({ size: 4, children: content })
    expect(result).toBe('    const x = 1;\n    const y = 2;')
  })

  test('should dedent and indent string children', () => {
    const content = `
      line1
        line2
      line3
    `
    const result = Indent({ children: content })
    // After dedent, relative indentation is preserved, then all lines get 2 spaces
    expect(result).toBe('  line1\n    line2\n  line3')
  })

  test('should handle single line content', () => {
    const content = 'const x = 1;'
    const result = Indent({ size: 2, children: content })
    expect(result).toBe('  const x = 1;')
  })

  test('should preserve relative indentation after dedent', () => {
    const content = '  indented\n    more indented\nno indent'
    const result = Indent({ size: 2, children: content })
    // After dedent removes common indent, then add 2 spaces to all
    expect(result).toBe('    indented\n      more indented\n  no indent')
  })

  test('should work with size 0', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const result = Indent({ size: 0, children: content })
    // With size 0, should dedent but not add indentation
    expect(result).toBe('const x = 1;\nconst y = 2;')
  })

  test('should handle empty lines in content', () => {
    const content = 'line1\n\nline2'
    const result = Indent({ size: 2, children: content })
    // Empty lines should be preserved
    expect(result).toBe('  line1\n  \n  line2')
  })

  test('should dedent template literals with leading/trailing newlines', () => {
    const content = `
      function test() {
        return true;
      }
    `
    const result = Indent({ size: 2, children: content })
    // Dedent removes common indentation, then add 2 spaces
    expect(result).toBe('  function test() {\n    return true;\n  }')
  })

  test('should handle content with tabs', () => {
    const content = 'line1\n\tline2'
    const result = Indent({ size: 2, children: content })
    // Dedent handles tabs, then indent adds spaces
    expect(result.startsWith('  line1')).toBe(true)
  })

  test('should handle already indented content', () => {
    const content = '    already indented\n    also indented'
    const result = Indent({ size: 2, children: content })
    // Dedent removes the common 4 spaces, then adds 2
    expect(result).toBe('  already indented\n  also indented')
  })
})
