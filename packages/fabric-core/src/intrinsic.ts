import { inject, provide } from './context.ts'
import { RenderContext, type RenderContextProps } from './contexts/RenderContext.ts'
import type { FabricElement, FabricNode } from './Fabric.ts'

type IntrinsicType =
  | 'br' // Line break - adds newline with current indentation
  | 'indent' // Increase indentation level
  | 'dedent' // Decrease indentation level

export type Intrinsic = {
  type: IntrinsicType
  __intrinsic: true
}

function isFabricElement<TProps extends object = object>(value: any): value is FabricElement<TProps> {
  return typeof value === 'function' && 'type' in value && 'component' in value
}

/**
 * Type guard to check if a value is an intrinsic element
 */
export function isIntrinsic(value: any): value is Intrinsic {
  return value && typeof value === 'object' && value.__intrinsic === true
}

/**
 * Render a single intrinsic node
 */
function renderIntrinsicNode(node: Intrinsic, renderContext: RenderContextProps): string {
  switch (node.type) {
    case 'br':
      renderContext.currentLineLength = 0
      return '\n'

    case 'indent':
      renderContext.indentLevel++
      return ''

    case 'dedent':
      renderContext.indentLevel = Math.max(0, renderContext.indentLevel - 1)
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
export function renderIndent(content: string, renderContext: RenderContextProps): string {
  if (content.length === 0) {
    return ''
  }

  const indentStr = ' '.repeat(renderContext.indentLevel * renderContext.indentSize)
  const lines = content.split('\n')
  let out = ''

  for (const [i, line] of lines.entries()) {
    if (renderContext.currentLineLength === 0 && line.length > 0) {
      // At start of a (logical) line: prefix indentation
      out += indentStr + line
      renderContext.currentLineLength = indentStr.length + line.length
    } else {
      out += line
      renderContext.currentLineLength += line.length
    }

    // If not the last line, add newline and reset line length so next line gets indentation
    if (i !== lines.length - 1) {
      out += '\n'
      renderContext.currentLineLength = 0
    }
  }

  return out
}

export function renderIntrinsic(children: FabricNode, context?: RenderContextProps): string {
  const renderContext = context || inject(RenderContext)

  provide(RenderContext, renderContext)

  if (!children) {
    return ''
  }

  if (isFabricElement(children)) {
    try {
      // FabricElements are already wrapped in transform by createComponent
      // Just call them and return the result (which is already a string)
      const result = children()
      return renderIntrinsic(result)
    } catch {
      return ''
    }
  }

  if (Array.isArray(children)) {
    return children.map((child) => renderIntrinsic(child)).join('')
  }

  if (isIntrinsic(children)) {
    // Render intrinsic node(s) using the shared render context
    return renderIntrinsicNode(children, renderContext)
  }

  if (typeof children === 'function') {
    return renderIntrinsic(children())
  }

  if (typeof children === 'string') {
    return renderIndent(children, renderContext)
  }

  if (typeof children === 'number') {
    return renderIndent(String(children), renderContext)
  }

  if (typeof children === 'boolean') {
    return renderIndent(children ? 'true' : 'false', renderContext)
  }

  // Fallback for FabricElement/object-like values
  try {
    return renderIndent(children, renderContext)
  } catch {
    return ''
  }
}

/**
 * Create an intrinsic element
 */
export function createIntrinsic(type: IntrinsicType): Intrinsic {
  return {
    type,
    __intrinsic: true,
  }
}
