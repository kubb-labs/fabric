import { NodeTreeContext, provide, useNodeTree } from '@kubb/fabric-core'
import type { FabricReactElement, FabricReactNode, JSDoc, Key } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

export type ConstProps = {
  key?: Key
  /**
   * Name of the const
   */
  name: string
  /**
   * Does this type need to be exported.
   */
  export?: boolean
  /**
   * Type to make the const being typed
   */
  type?: string
  /**
   * Options for JSdocs.
   */
  JSDoc?: JSDoc
  /**
   * Use of `const` assertions
   */
  asConst?: boolean
  /**
   * Children nodes.
   */
  children?: FabricReactNode
}

/**
 * Generates a TypeScript constant declaration.
 */
export function Const({ children, ...props }: ConstProps): FabricReactElement {
  const { name, export: canExport, type, JSDoc, asConst } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Const', props })

    provide(NodeTreeContext, childTree)
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
      const {name}
      {type ? (
        <>
          {':'}
          {type}{' '}
        </>
      ) : (
        ' '
      )}
      = {children}
      {asConst && <> as const</>}
    </>
  )
}

Const.displayName = 'Const'
