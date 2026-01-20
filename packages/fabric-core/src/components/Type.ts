import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

export type TypeProps = {
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
  children?: FabricNode
}

/**
 * Generates a TypeScript type declaration.
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

  let result = ''

  if (JSDoc?.comments) {
    result += createJSDoc({ comments: JSDoc.comments })
    result += '\n'
  }

  if (canExport) {
    result += 'export '
  }

  result += `type ${name} = ${children || ''}`

  return result
})

Type.displayName = 'KubbType'
