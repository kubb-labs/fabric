import { NodeTreeContext, provide, useNodeTree } from '@kubb/fabric-core'
import type { FabricReactElement, FabricReactNode, JSDoc, Key } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

export type TypeProps = {
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
  /**
   * Children nodes.
   */
  children?: FabricReactNode
}

/**
 * Generates a TypeScript type declaration.
 */
export function Type({ children, ...props }: TypeProps): FabricReactElement {
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

Type.displayName = 'Type'
