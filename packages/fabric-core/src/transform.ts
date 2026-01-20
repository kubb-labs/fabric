import { inject, provide } from './context.ts'
import { RenderContext } from './contexts/RenderContext.ts'
import { createComponent } from './createComponent.ts'
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
function renderIntrinsicNode(node: Intrinsic): string {
  const renderContext = inject(RenderContext)

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
function renderString(content: string): string {
  const renderContext = inject(RenderContext)

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

export function transform(children: FabricNode): string {
  const renderContext = inject(RenderContext)

  provide(RenderContext, renderContext)

  if (!children) {
    return ''
  }

  if (isFabricElement(children)) {
    try {
      // FabricElements are already wrapped in transform by createComponent
      // Just call them and return the result (which is already a string)
      const result = children()
      return transform(result)
    } catch {
      return ''
    }
  }

  if (Array.isArray(children)) {
    return children.map((child) => transform(child)).join('')
  }

  if (isIntrinsic(children)) {
    // Render intrinsic node(s) using the shared render context
    return renderIntrinsicNode(children)
  }

  if (typeof children === 'function') {
    return transform(children())
  }

  if (typeof children === 'string') {
    return renderString(children)
  }

  if (typeof children === 'number') {
    return renderString(String(children))
  }

  if (typeof children === 'boolean') {
    return renderString(children ? 'true' : 'false')
  }

  // Fallback for FabricElement/object-like values
  try {
    return renderString(children)
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
