import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

export type ConstProps = {
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
  children?: FabricNode
}

/**
 * Generates a TypeScript constant declaration.
 */
export const Const = createComponent('Const', ({ children, ...props }: ConstProps) => {
  const { name, export: canExport, type, JSDoc, asConst } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Const', props })

    provide(NodeTreeContext, childTree)
  }

  let result = ''

  if (JSDoc?.comments) {
    result += createJSDoc({ comments: JSDoc.comments })
    result += '\n'
  }

  if (canExport) {
    result += 'export '
  }

  result += `const ${name}`

  if (type) {
    result += `: ${type}`
  }

  result += ` = ${children ? children : ''}`

  if (asConst) {
    result += ' as const'
  }

  return result
})

Const.displayName = 'KubbConst'
