import type { RefKey } from '@kubb/fabric-core'
import type { JSDoc, Key, KubbNode } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'
import { Indent } from './Indent.tsx'

type Props = {
  key?: Key
  /**
   * Name of the interface
   */
  name: string
  /**
   * Does this interface need to be exported.
   */
  export?: boolean
  /**
   * Generic type parameters
   */
  generics?: string | string[]
  /**
   * Extends clause for interface inheritance
   */
  extends?: string | string[]
  /**
   * Options for JSdocs.
   */
  JSDoc?: JSDoc
  /**
   * RefKey for automatic import management.
   * This is metadata used by the refKeyPlugin and doesn't affect the component output directly.
   * Inspired by Alloy's refkey system.
   */
  refkey?: RefKey
  /**
   * Interface properties
   */
  children?: KubbNode
}

/**
 * Interface declaration component inspired by Alloy's declarative approach.
 * Supports automatic import management via refkeys.
 * 
 * @example
 * ```tsx
 * <Interface name="User" export>
 *   id: number{'\n'}
 *   name: string{'\n'}
 *   email?: string
 * </Interface>
 * // Outputs:
 * // export interface User {
 * //   id: number
 * //   name: string
 * //   email?: string
 * // }
 * ```
 */
export function Interface({ name, export: canExport, generics, extends: extendsClause, JSDoc, children }: Props) {
  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      interface {name}
      {generics && (
        <>
          {'<'}
          {Array.isArray(generics) ? generics.join(', ').trim() : generics}
          {'>'}
        </>
      )}
      {extendsClause && (
        <>
          {' extends '}
          {Array.isArray(extendsClause) ? extendsClause.join(', ').trim() : extendsClause}
        </>
      )}
      {' {'}
      <br />
      <Indent size={2}>{children}</Indent>
      <br />
      {'}'}
    </>
  )
}

Interface.displayName = 'KubbInterface'
