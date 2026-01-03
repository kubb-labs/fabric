/**
 * Intrinsic formatting elements for code generation
 * Inspired by Alloy framework's intrinsic system
 *
 * These are special formatting elements that are processed during rendering
 * to provide precise control over whitespace, line breaks, and indentation.
 */

export type IntrinsicType =
  | 'br' // Line break - adds newline with current indentation
  | 'hbr' // Hard break - always breaks regardless of context
  | 'sbr' // Soft break - breaks only if needed
  | 'lbr' // Literal break - raw newline without indentation
  | 'indent' // Increase indentation level
  | 'dedent' // Decrease indentation level
  | 'align' // Align to current column
  | 'group' // Group that tries single line, breaks if needed
  | 'ifBreak' // Conditional content based on breaking
  | 'indentIfBreak' // Indent only if parent group breaks
  | 'fill' // Fill with line breaks when needed

export type Intrinsic = {
  type: IntrinsicType
  content?: string | Intrinsic | (string | Intrinsic)[]
  thenContent?: string | Intrinsic | (string | Intrinsic)[]
  elseContent?: string | Intrinsic | (string | Intrinsic)[]
  __intrinsic: true
}

/**
 * Type guard to check if a value is an intrinsic element
 */
export function isIntrinsic(value: any): value is Intrinsic {
  return value && typeof value === 'object' && value.__intrinsic === true
}

/**
 * Create an intrinsic element
 */
function createIntrinsic(type: IntrinsicType, content?: any): Intrinsic {
  return {
    type,
    content,
    __intrinsic: true,
  }
}

/**
 * Line break - adds newline with current indentation
 * @example code`hello${br}world` => "hello\nworld"
 */
export const br = createIntrinsic('br')

/**
 * Hard break - always breaks regardless of context
 * Used when you absolutely need a line break
 */
export const hbr = createIntrinsic('hbr')

/**
 * Soft break - breaks only if needed (e.g., when line is too long)
 * In basic implementation, behaves like br
 */
export const sbr = createIntrinsic('sbr')

/**
 * Literal break - raw newline without indentation
 * Useful for specific formatting needs
 */
export const lbr = createIntrinsic('lbr')

/**
 * Increase indentation level for subsequent content
 * @example code`{${indent}${br}content${dedent}${br}}`
 */
export const indent = createIntrinsic('indent')

/**
 * Decrease indentation level for subsequent content
 */
export const dedent = createIntrinsic('dedent')

/**
 * Align subsequent content to the current column position
 * Useful for aligning parameters across multiple lines
 */
export const align = createIntrinsic('align')

/**
 * Group content that should try to fit on a single line
 * If it doesn't fit, it breaks according to internal break points
 * @param strings - Template string parts
 * @param values - Template values
 */
export function group(strings: TemplateStringsArray, ...values: any[]): Intrinsic {
  const content: (string | Intrinsic)[] = []
  for (let i = 0; i < strings.length; i++) {
    if (strings[i]) content.push(strings[i])
    if (i < values.length && values[i] !== null && values[i] !== undefined) {
      content.push(values[i])
    }
  }
  return {
    type: 'group',
    content,
    __intrinsic: true,
  }
}

/**
 * Conditional content based on whether parent group breaks
 * @param thenContent - Content when parent breaks
 * @param elseContent - Content when parent doesn't break
 */
export function ifBreak(thenContent: string | Intrinsic | (string | Intrinsic)[], elseContent?: string | Intrinsic | (string | Intrinsic)[]): Intrinsic {
  return {
    type: 'ifBreak',
    thenContent,
    elseContent,
    __intrinsic: true,
  }
}

/**
 * Indent only if parent group breaks
 * Useful for conditional indentation in complex layouts
 */
export const indentIfBreak = createIntrinsic('indentIfBreak')

/**
 * Fill with line breaks when content is too long
 * Useful for paragraph-style content
 * @param strings - Template string parts
 * @param values - Template values
 */
export function fill(strings: TemplateStringsArray, ...values: any[]): Intrinsic {
  const content: (string | Intrinsic)[] = []
  for (let i = 0; i < strings.length; i++) {
    if (strings[i]) content.push(strings[i])
    if (i < values.length && values[i] !== null && values[i] !== undefined) {
      content.push(values[i])
    }
  }
  return {
    type: 'fill',
    content,
    __intrinsic: true,
  }
}

/**
 * Rendering context for processing intrinsics
 */
export type RenderContext = {
  indentLevel: number
  indentSize: number
  currentLineLength: number
  shouldBreak: boolean
}

/**
 * Render intrinsics to a string
 * This is a basic implementation - can be enhanced with pretty-printing logic
 */
export function renderIntrinsics(
  content: string | Intrinsic | (string | Intrinsic)[],
  context: RenderContext = { indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false },
): string {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content.map((item) => renderIntrinsics(item, context)).join('')
  }

  if (!isIntrinsic(content)) {
    return String(content)
  }

  const indentStr = ' '.repeat(context.indentLevel * context.indentSize)

  switch (content.type) {
    case 'br':
    case 'hbr':
    case 'sbr':
      context.currentLineLength = 0
      return `\n${indentStr}`

    case 'lbr':
      context.currentLineLength = 0
      return '\n'

    case 'indent':
      context.indentLevel++
      return ''

    case 'dedent':
      context.indentLevel = Math.max(0, context.indentLevel - 1)
      return ''

    case 'align':
      // In basic implementation, maintain current indent
      return ''

    case 'group':
      // Basic implementation: just render content
      // Advanced: could try single line first, then break if too long
      return renderIntrinsics(content.content || '', context)

    case 'ifBreak': {
      // Use thenContent if should break, else elseContent
      const selectedContent = context.shouldBreak ? content.thenContent : content.elseContent
      return selectedContent ? renderIntrinsics(selectedContent, context) : ''
    }

    case 'indentIfBreak':
      if (context.shouldBreak) {
        context.indentLevel++
      }
      return ''

    case 'fill':
      // Basic implementation: just render content
      // Advanced: could insert breaks based on line length
      return renderIntrinsics(content.content || '', context)

    default:
      return ''
  }
}
