import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'
import { Text } from './Text.ts'

type Props = {
  /**
   * Name of the const
   */
  readonly name: string
  /**
   * Does this type need to be exported.
   */
  readonly export?: boolean
  /**
   * Type to make the const being typed
   */
  readonly type?: string
  /**
   * Options for JSdocs.
   */
  readonly JSDoc?: JSDoc
  /**
   * Use of `const` assertions
   */
  readonly asConst?: boolean
  readonly children?: string
}

export function Const({ children, ...props }: Props): string {
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

  return Text({ children: result })
}

Const.displayName = 'KubbConst'
