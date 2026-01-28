import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import { renderIntrinsic } from '../intrinsic.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

export type ConstProps = {
  /**
   * Name of the constant.
   */
  name: string
  /**
   * Export this constant.
   * - `true` generates `export const`
   * - `false` generates internal const
   * @default false
   */
  export?: boolean
  /**
   * TypeScript type annotation.
   *
   * @example 'string' or 'User[]'
   */
  type?: string
  /**
   * JSDoc comments for the constant.
   */
  JSDoc?: JSDoc
  /**
   * Use const assertion.
   * - `true` adds `as const` for deep readonly
   * - `false` uses inferred or explicit type
   * @default false
   */
  asConst?: boolean
  /**
   * Constant value.
   */
  children?: FabricNode
}

/**
 * Generates a TypeScript constant declaration.
 *
 * @example
 * ```tsx
 * <Const name="API_URL" export type="string">
 *   'https://api.example.com'
 * </Const>
 * ```
 */
export const Const = createComponent('Const', ({ children, ...props }: ConstProps) => {
  const { name, export: canExport, type, JSDoc, asConst } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Const', props })

    provide(NodeTreeContext, childTree)
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

  result += `const ${name}`

  if (type) {
    result += `: ${type}`
  }

  result += ` = ${children ? value : ''}`

  if (asConst) {
    result += ' as const'
  }

  return result
})

Const.displayName = 'Const'
