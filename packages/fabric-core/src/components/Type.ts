import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import { renderIntrinsic } from '../intrinsic.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

export type TypeProps = {
  /**
   * Name of the type (must start with a capital letter).
   */
  name: string
  /**
   * Export this type.
   * - `true` generates `export type`
   * - `false` generates internal type
   * @default false
   */
  export?: boolean
  /**
   * JSDoc comments for the type.
   */
  JSDoc?: JSDoc
  /**
   * Type definition.
   */
  children?: FabricNode
}

/**
 * Generates a TypeScript type declaration.
 *
 * @example
 * ```tsx
 * <Type name="User" export>
 *   {'{'} id: number; name: string {'}'}
 * </Type>
 * ```
 */
export const Type = createComponent('Type', ({ children, ...props }: TypeProps) => {
  const { name, export: canExport, JSDoc } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Type', props })

    provide(NodeTreeContext, childTree)
  }

  if (name.charAt(0).toUpperCase() !== name.charAt(0)) {
    throw new Error('Name should start with a capital letter (see TypeScript types)')
  }

  const value = renderIntrinsic(children)

  let result = ''

  if (JSDoc?.comments) {
    result += createJSDoc({ comments: JSDoc.comments })
    result += '\n'
  }

  if (canExport) {
    result += 'export '
  }

  result += `type ${name} = ${value || ''}`

  return result
})

Type.displayName = 'Type'
