import type { KubbElement } from '@kubb/react-fabric/types'
import { Indent } from './Indent.tsx'

type BlockWithIndentProps = {
  /**
   * The size of indentation (number of spaces)
   * @default 2
   */
  size?: number
  /**
   * Children to be indented
   */
  children?: React.ReactNode
}

/**
 * A reusable component that wraps children with proper indentation.
 * This component encapsulates the pattern of:
 * ```tsx
 * <br />
 * <Indent size={2}>{children}</Indent>
 * <br />
 * ```
 *
 * Usage:
 * ```tsx
 * {' {'}
 * <BlockWithIndent>{children}</BlockWithIndent>
 * {'}'}
 * ```
 *
 * This is the JSX equivalent of the fabric-core pattern:
 * ```ts
 * [parts.join(''), Br(), Indent(), children, Br(), Dedent(), '}']
 * ```
 */
export function BlockWithIndent({ size = 2, children }: BlockWithIndentProps): KubbElement {
  if (!children) {
    return <></>
  }

  return (
    <>
      <br />
      <Indent size={size}>{children}</Indent>
      <br />
    </>
  )
}

BlockWithIndent.displayName = 'BlockWithIndent'
