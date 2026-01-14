import { NodeTreeContext, provide, useNodeTree } from '@kubb/fabric-core'
import type { JSDoc, Key, KubbNode } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

type Props = {
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
  children?: KubbNode
}

/**
 * Renders a constant declaration. Supports optional export, type and JSDoc.
 */
export function Const({ children, ...props }: Props) {
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
      const {name}{' '}
      {type && (
        <>
          {':'}
          {type}{' '}
        </>
      )}
      = {children}
      {asConst && <> as const</>}
    </>
  )
}

Const.displayName = 'KubbConst'
