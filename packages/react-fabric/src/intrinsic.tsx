/**
 * React intrinsic components for code generation
 * These are React equivalents of the fabric-core intrinsic elements
 */

import React from 'react'

/**
 * Intrinsic marker component - base for all intrinsic elements
 * These are processed during rendering to control formatting
 */
const IntrinsicMarker = Symbol('Intrinsic')

type IntrinsicProps = {
  type: string
  children?: React.ReactNode
  thenContent?: React.ReactNode
  elseContent?: React.ReactNode
}

function Intrinsic({ type, children, thenContent, elseContent }: IntrinsicProps) {
  // This component is a marker that gets processed by the renderer
  // It doesn't render anything directly in React
  return null
}
// Attach the marker to identify intrinsic components
;(Intrinsic as any)[IntrinsicMarker] = true

/**
 * Check if a React element is an intrinsic component
 */
export function isReactIntrinsic(element: any): boolean {
  return React.isValidElement(element) && (element.type as any)?.[IntrinsicMarker] === true
}

/**
 * Line break - adds newline with current indentation
 *
 * Can be used as:
 * - JSX intrinsic: `<br />` (no import needed - works like HTML br)
 * - Component import: `import { Br } from '@kubb/react-fabric'` then `<Br />`
 *
 * @example
 * // Option 1: Native JSX intrinsic (no import needed)
 * <>
 *   function hello() {'{'}
 *   <br />
 *   console.log("hi")
 *   <br />
 *   {'}'}
 * </>
 *
 * // Option 2: Explicit component import
 * import { Br } from '@kubb/react-fabric'
 * <>
 *   <Br />
 * </>
 */
export function Br() {
  return <Intrinsic type="br" />
}
;(Br as any)[IntrinsicMarker] = true

/**
 * Hard break - always breaks regardless of context
 */
export function Hbr() {
  return <Intrinsic type="hbr" />
}
;(Hbr as any)[IntrinsicMarker] = true

/**
 * Soft break - breaks only if needed
 */
export function Sbr() {
  return <Intrinsic type="sbr" />
}
;(Sbr as any)[IntrinsicMarker] = true

/**
 * Literal break - raw newline without indentation
 */
export function Lbr() {
  return <Intrinsic type="lbr" />
}
;(Lbr as any)[IntrinsicMarker] = true

/**
 * Increase indentation level
 * @example
 * <>
 *   {'{'}
 *   <IndentIncrease />
 *   <Br />
 *   content
 *   <IndentDecrease />
 *   <Br />
 *   {'}'}
 * </>
 */
export function IndentIncrease() {
  return <Intrinsic type="indent" />
}
;(IndentIncrease as any)[IntrinsicMarker] = true

/**
 * Decrease indentation level
 */
export function IndentDecrease() {
  return <Intrinsic type="dedent" />
}
;(IndentDecrease as any)[IntrinsicMarker] = true

/**
 * Align to current column
 */
export function Align() {
  return <Intrinsic type="align" />
}
;(Align as any)[IntrinsicMarker] = true

/**
 * Group content that tries to fit on single line
 */
export function Group({ children }: { children?: React.ReactNode }) {
  return <Intrinsic type="group">{children}</Intrinsic>
}
;(Group as any)[IntrinsicMarker] = true

/**
 * Conditional content based on breaking
 */
export function IfBreak({ thenContent, elseContent }: { thenContent: React.ReactNode; elseContent?: React.ReactNode }) {
  return <Intrinsic type="ifBreak" thenContent={thenContent} elseContent={elseContent} />
}
;(IfBreak as any)[IntrinsicMarker] = true

/**
 * Indent only if parent breaks
 */
export function IndentIfBreak() {
  return <Intrinsic type="indentIfBreak" />
}
;(IndentIfBreak as any)[IntrinsicMarker] = true

/**
 * Fill with breaks when needed
 */
export function Fill({ children }: { children?: React.ReactNode }) {
  return <Intrinsic type="fill">{children}</Intrinsic>
}
;(Fill as any)[IntrinsicMarker] = true

/**
 * Process an intrinsic type and update context/return string
 * This is shared logic used by both processReactIntrinsics and squashTextNodes
 */
export function processIntrinsicType(
  type: string,
  context: { indentLevel: number; indentSize: number },
  childrenProcessor?: () => string,
  thenContentProcessor?: () => string,
): string {
  const indentStr = ' '.repeat(context.indentLevel * context.indentSize)

  switch (type) {
    case 'br':
    case 'hbr':
    case 'sbr':
      return `\n${indentStr}`

    case 'lbr':
      return '\n'

    case 'indent':
      context.indentLevel++
      return ''

    case 'dedent':
      context.indentLevel = Math.max(0, context.indentLevel - 1)
      return ''

    case 'align':
      return ''

    case 'group':
      return childrenProcessor?.() || ''

    case 'ifBreak':
      // Basic implementation: use thenContent
      return thenContentProcessor?.() || ''

    case 'indentIfBreak':
      context.indentLevel++
      return ''

    case 'fill':
      return childrenProcessor?.() || ''

    default:
      return ''
  }
}

/**
 * Process React intrinsic elements during rendering
 * This is called by the React renderer to convert intrinsic components to strings
 */
export function processReactIntrinsics(element: React.ReactNode, context = { indentLevel: 0, indentSize: 2 }): string {
  if (typeof element === 'string') {
    return element
  }

  if (typeof element === 'number' || typeof element === 'boolean') {
    return String(element)
  }

  if (element === null || element === undefined) {
    return ''
  }

  if (Array.isArray(element)) {
    return element.map((child) => processReactIntrinsics(child, context)).join('')
  }

  if (!React.isValidElement(element)) {
    return ''
  }

  // Check if it's an intrinsic component
  if (isReactIntrinsic(element)) {
    const props = element.props as IntrinsicProps

    return processIntrinsicType(
      props.type,
      context,
      () => processReactIntrinsics(props.children, context),
      () => processReactIntrinsics(props.thenContent, context),
    )
  }

  // Process React Fragment
  if (element.type === React.Fragment) {
    return processReactIntrinsics(element.props.children, context)
  }

  // For other React elements, process children
  if (element.props.children) {
    return processReactIntrinsics(element.props.children, context)
  }

  return ''
}
