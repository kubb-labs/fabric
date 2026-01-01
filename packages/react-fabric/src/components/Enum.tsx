import type { RefKey } from '@kubb/fabric-core'
import type { JSDoc, Key, KubbNode } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'
import { Indent } from './Indent.tsx'

type Props = {
  key?: Key
  /**
   * Name of the enum
   */
  name: string
  /**
   * Does this enum need to be exported.
   */
  export?: boolean
  /**
   * Is this a const enum
   */
  const?: boolean
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
   * Enum members
   */
  children?: KubbNode
}

/**
 * Enum declaration component inspired by Alloy's declarative approach.
 * Supports automatic import management via refkeys.
 * 
 * @example
 * ```tsx
 * <Enum name="Status" export>
 *   Pending = "pending",{'\n'}
 *   Active = "active",{'\n'}
 *   Completed = "completed"
 * </Enum>
 * // Outputs:
 * // export enum Status {
 * //   Pending = "pending",
 * //   Active = "active",
 * //   Completed = "completed"
 * // }
 * ```
 */
export function Enum({ name, export: canExport, const: isConst, JSDoc, children }: Props) {
  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      {isConst && <>const </>}
      enum {name} {'{'}
      <br />
      <Indent size={2}>{children}</Indent>
      <br />
      {'}'}
    </>
  )
}

Enum.displayName = 'KubbEnum'
