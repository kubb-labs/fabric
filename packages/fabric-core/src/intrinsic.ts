/**
 * Intrinsic formatting elements for code generation
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
 * Rendering context for processing intrinsics
 */
export type RenderContext = {
  indentLevel: number
  indentSize: number
  currentLineLength: number
  shouldBreak: boolean
}

/**
 * Helper: render a plain string while applying current indentation at the
 * start of each logical line. This ensures `${indent}` intrinsics affect
 * subsequent string content.
 */
function renderString(content: string, context: RenderContext): string {
  if (content.length === 0) {
    return ''
  }

  const indentStr = ' '.repeat(context.indentLevel * context.indentSize)
  const lines = content.split('\n')
  let out = ''

  for (const [i, line] of lines.entries()) {
    if (context.currentLineLength === 0 && line.length > 0) {
      // At start of a (logical) line: prefix indentation
      out += indentStr + line
      context.currentLineLength = indentStr.length + line.length
    } else {
      out += line
      context.currentLineLength += line.length
    }

    // If not the last line, add newline and reset line length so next line gets indentation
    if (i !== lines.length - 1) {
      out += '\n'
      context.currentLineLength = 0
    }
  }

  return out
}

/**
 * Render a single intrinsic node
 */
function renderIntrinsicNode(node: Intrinsic, context: RenderContext): string {
  switch (node.type) {
    case 'br':
    case 'hbr':
    case 'sbr':
      // newline only; next string part will pick up indentation
      context.currentLineLength = 0
      return '\n'

    case 'lbr':
      context.currentLineLength = 0
      return '\n'

    case 'indent':
      context.indentLevel++
      return ''

    case 'dedent':
      context.indentLevel = Math.max(0, context.indentLevel - 1)
      return ''

    default:
      return ''
  }
}

export function renderIntrinsics(
  content: string | Intrinsic | (string | Intrinsic)[],
  context: RenderContext = { indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false },
): string {
  if (typeof content === 'string') {
    return renderString(content, context)
  }

  if (Array.isArray(content)) {
    return content.map((item) => renderIntrinsics(item, context)).join('')
  }

  if (!isIntrinsic(content)) {
    return String(content)
  }

  return renderIntrinsicNode(content, context)
}

/**
 * Wrapper for top-level rendering to normalize whitespace
 */
export function renderIntrinsicsNormalized(content: string | Intrinsic | (string | Intrinsic)[], context?: RenderContext): string {
  const result = renderIntrinsics(content, context)

  // Trim leading and trailing whitespace/newlines, but preserve internal formatting
  return result.replace(/^\s+/, '').replace(/\s+$/, '')
}
