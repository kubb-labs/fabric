import type { RefKey } from '@kubb/fabric-core'
import type { JSDoc, Key, KubbNode } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

type Props = {
  key?: Key
  /**
   * Name of the variable
   */
  name: string
  /**
   * Does this variable need to be exported.
   */
  export?: boolean
  /**
   * Type annotation for the variable
   */
  type?: string
  /**
   * Options for JSdocs.
   */
  JSDoc?: JSDoc
  /**
   * RefKey for automatic import management.
   * Inspired by Alloy's refkey system.
   */
  refkey?: RefKey
  /**
   * Variable declaration keyword (const, let, var)
   * @default 'const'
   */
  kind?: 'const' | 'let' | 'var'
  children?: KubbNode
}

/**
 * Variable declaration component inspired by Alloy's VarDeclaration.
 * Supports automatic import management via refkeys.
 * 
 * @example
 * ```tsx
 * const fooRef = createRefKey()
 * 
 * <VarDeclaration 
 *   name="foo" 
 *   export 
 *   refkey={fooRef}
 * >
 *   "hello world"
 * </VarDeclaration>
 * // Outputs: export const foo = "hello world"
 * ```
 */
export function VarDeclaration({ name, export: canExport, type, JSDoc, kind = 'const', children }: Props) {
  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      {kind} {name}
      {type && (
        <>
          {': '}
          {type}
        </>
      )}{' '}
      = {children}
    </>
  )
}

VarDeclaration.displayName = 'KubbVarDeclaration'
