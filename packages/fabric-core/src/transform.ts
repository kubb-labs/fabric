import { createComponent, isFabricElement } from './createComponent.ts'
import type { FabricNode } from './Fabric.ts'

export type IntrinsicType =
  | 'br' // Line break - adds newline with current indentation
  | 'indent' // Increase indentation level
  | 'dedent' // Decrease indentation level

export type Intrinsic = {
  type: IntrinsicType
  __intrinsic: true
}

/**
 * Type guard to check if a value is an intrinsic element
 */
export function isIntrinsic(value: any): value is Intrinsic {
  return value && typeof value === 'object' && value.__intrinsic === true
}

type RenderContext = {
  indentLevel: number
  indentSize: number
  currentLineLength: number
  shouldBreak: boolean
}

/**
 * Render a single intrinsic node
 */
function renderIntrinsicNode(node: Intrinsic, context: RenderContext): string {
  switch (node.type) {
    case 'br':
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

export function transform(children: FabricNode, context: RenderContext = { indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false }): string {
  if (!children) {
    return ''
  }

  if (isFabricElement(children)) {
    try {
      const result = children()
      return transform(result, context)
    } catch {
      return ''
    }
  }

  if (Array.isArray(children)) {
    return children.map((child) => transform(child, context)).join('')
  }

  if (isIntrinsic(children)) {
    // Render intrinsic node(s) using the intrinsic renderer with default context
    return renderIntrinsicNode(children, context)
  }

  if (typeof children === 'function') {
    return transform(children(), context)
  }

  if (typeof children === 'string') {
    return renderString(children, context)
  }

  if (typeof children === 'number') {
    return renderString(String(children), context)
  }

  if (typeof children === 'boolean') {
    return renderString(children ? 'true' : 'false', context)
  }

  // Fallback for FabricElement/object-like values
  try {
    return renderString(children, context)
  } catch {
    return ''
  }
}

/**
 * Create an intrinsic element
 */
function createIntrinsic(type: IntrinsicType): Intrinsic {
  return {
    type,
    __intrinsic: true,
  }
}

export const Br = createComponent('br', () => {
  return createIntrinsic('br')
})

Br.displayName = 'Br'

export const Dedent = createComponent('indent', () => {
  return createIntrinsic('dedent')
})
Dedent.displayName = 'Dedent'

export const Indent = createComponent('indent', () => {
  return createIntrinsic('indent')
})
Indent.displayName = 'Indent'
