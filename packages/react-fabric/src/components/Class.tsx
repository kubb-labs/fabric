import type { RefKey } from '@kubb/fabric-core'
import type { JSDoc, Key, KubbNode } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'
import { Indent } from './Indent.tsx'

type Props = {
  key?: Key
  /**
   * Name of the class
   */
  name: string
  /**
   * Does this class need to be exported.
   */
  export?: boolean
  /**
   * Is this an abstract class
   */
  abstract?: boolean
  /**
   * Generic type parameters
   */
  generics?: string | string[]
  /**
   * Extends clause for class inheritance
   */
  extends?: string
  /**
   * Implements clause for interface implementation
   */
  implements?: string | string[]
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
   * Class body (properties and methods)
   */
  children?: KubbNode
}

/**
 * Class declaration component inspired by Alloy's declarative approach.
 * Supports automatic import management via refkeys.
 * 
 * @example
 * ```tsx
 * <Class name="User" export>
 *   constructor(public name: string) {'{}'}{'\n'}
 *   {'\n'}
 *   greet() {'{'}{'\n'}
 *   {'  '}return `Hello, ${'{'}this.name{'}'}!`{'\n'}
 *   {'}'}
 * </Class>
 * ```
 */
export function Class({ name, export: canExport, abstract, generics, extends: extendsClause, implements: implementsClause, JSDoc, children }: Props) {
  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      {abstract && <>abstract </>}
      class {name}
      {generics && (
        <>
          {'<'}
          {Array.isArray(generics) ? generics.join(', ').trim() : generics}
          {'>'}
        </>
      )}
      {extendsClause && <> extends {extendsClause}</>}
      {implementsClause && (
        <>
          {' implements '}
          {Array.isArray(implementsClause) ? implementsClause.join(', ').trim() : implementsClause}
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

Class.displayName = 'KubbClass'
