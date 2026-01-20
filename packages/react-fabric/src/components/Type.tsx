import { NodeTreeContext, provide, useNodeTree } from '@kubb/fabric-core'
import type { JSDoc, Key, KubbElement, KubbNode } from '../types.ts'
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
export function Type({ children, ...props }: TypeProps): KubbElement {
  const { name, export: canExport, JSDoc } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Type', props })

    provide(NodeTreeContext, childTree)
  }

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
