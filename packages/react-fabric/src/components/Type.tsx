import type { JSDoc, Key, KubbNode } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

type Props = {
  key?: Key
  /**
   * Name of the type, this needs to start with a capital letter.
   */
  name: string
  /**
   * Does this type need to be exported.
   */
  export?: boolean
  /**
   * Options for JSdocs.
   */
  JSDoc?: JSDoc
  children?: KubbNode
}

/**
 * Renders a TypeScript type alias. Validates that the provided name starts
 * with a capital letter and optionally emits JSDoc comments.
 */
export function Type({ name, export: canExport, JSDoc, children }: Props) {
  if (name.charAt(0).toUpperCase() !== name.charAt(0)) {
    throw new Error('Name should start with a capital letter(see TypeScript types)')
  }

  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      type {name} = {children}
    </>
  )
}

Type.displayName = 'KubbType'
