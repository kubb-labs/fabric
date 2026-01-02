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

  test('should preserve empty lines up to 2', () => {
    const content = 'line1\n\n\nline2'
    const result = Indent({ children: content })
    const lines = result.split('\n')
    // Should keep at most 2 consecutive empty lines
    expect(lines.filter((l) => l.trim() === '').length).toBeLessThanOrEqual(2)
  })

  test('should collapse more than 2 consecutive newlines', () => {
    const content = 'line1\n\n\n\n\nline2'
    const result = Indent({ children: content })
    // Should not have more than 2 consecutive empty lines
    expect(result).not.toContain('\n\n\n\n')
  })

  test('should handle single line content', () => {
    const content = 'const x = 1;'
    const result = Indent({ size: 2, children: content })
    expect(result).toBe('  const x = 1;')
  })

  test('should handle content with mixed spacing', () => {
    const content = '  indented\n    more indented\nno indent'
    const result = Indent({ size: 2, children: content })
    // Each line should get additional indentation
    expect(result).toContain('    indented')
    expect(result).toContain('      more indented')
    expect(result).toContain('  no indent')
  })

  test('should work with size 0', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const result = Indent({ size: 0, children: content })
    // With size 0, should still process (collapse newlines) but not add indentation
    expect(result).not.toBe('')
  })

  test('should handle multiline with empty lines in between', () => {
    const content = 'function test() {\n\n  return true;\n\n}'
    const result = Indent({ size: 2, children: content })
    expect(result).toContain('  function test() {')
    expect(result).toContain('    return true;')
    expect(result).toContain('  }')
  })

  test('should dedent before indenting', () => {
    const content = `
      function test() {
        return true;
      }
    `
    const result = Indent({ size: 2, children: content })
    // Should dedent first, then indent by 2
    expect(result.trim()).toContain('  function test() {')
  })
})
