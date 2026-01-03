/**
 * React intrinsic components for code generation
 * These are React equivalents of the fabric-core intrinsic elements
 */

import React from 'react'
import { renderIntrinsics, type Intrinsic, type RenderContext } from '@kubb/fabric-core'

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
 * Convert React element to Intrinsic object for core processing
 */
function reactElementToIntrinsic(element: React.ReactElement, processChildren: (node: React.ReactNode) => Intrinsic | string | (Intrinsic | string)[]): Intrinsic | string {
  const props = element.props as IntrinsicProps
  
  const intrinsic: Intrinsic = {
    type: props.type as any,
    __intrinsic: true,
  }

  if (props.children) {
    intrinsic.content = processChildren(props.children)
  }
  
  if (props.thenContent) {
    intrinsic.thenContent = processChildren(props.thenContent)
  }
  
  if (props.elseContent) {
    intrinsic.elseContent = processChildren(props.elseContent)
  }

  return intrinsic
}

/**
 * Process React intrinsic elements and DOM nodes during rendering
 * This unified function handles both React components and DOM elements
 * Uses fabric-core's renderIntrinsics for consistent behavior across frameworks
 * 
 * @param element - React element, DOM node name, or primitive value
 * @param context - Indentation context for formatting
 * @param childrenProcessor - Optional function to process children (for DOM nodes)
 * @param thenContentProcessor - Optional function to process thenContent (for ifBreak)
 * @returns Formatted string output
 */
export function processReactIntrinsics(
  element: React.ReactNode | string,
  context: RenderContext = { indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false },
  childrenProcessor?: () => string,
  thenContentProcessor?: () => string,
): string {
  // Handle primitive types
  if (typeof element === 'string') {
    // Check if it's an intrinsic type name (for DOM nodes)
    const intrinsicTypes = ['br', 'hbr', 'sbr', 'lbr', 'indent', 'dedent', 'align', 'group', 'ifBreak', 'indentIfBreak', 'fill']
    if (intrinsicTypes.includes(element)) {
      // Create intrinsic object and use core's renderIntrinsics
      const intrinsic: Intrinsic = {
        type: element as any,
        __intrinsic: true,
      }
      
      // Add content processors if provided
      if (childrenProcessor) {
        intrinsic.content = childrenProcessor()
      }
      
      if (thenContentProcessor) {
        intrinsic.thenContent = thenContentProcessor()
      }
      
      return renderIntrinsics(intrinsic, context)
    }
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

  // Check if it's an intrinsic React component
  if (isReactIntrinsic(element)) {
    const intrinsic = reactElementToIntrinsic(element, (node) => {
      if (typeof node === 'string') return node
      if (Array.isArray(node)) {
        return node.map(child => {
          const result = processReactIntrinsics(child, context)
          return result
        })
      }
      return processReactIntrinsics(node, context)
    })
    
    // Use core's renderIntrinsics for consistent behavior
    return renderIntrinsics(intrinsic, context)
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
