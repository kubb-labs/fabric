import { code } from '../code.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { type ComponentBuilder, createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import { br, dedent, indent } from '../intrinsic.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'
import { Text } from './Text.ts'

type FunctionProps = {
  /**
   * Name of the function.
   */
  name: string
  /**
   * Add default when export is being used
   */
  default?: boolean
  /**
   * Parameters/options/props that need to be used.
   */
  params?: string
  /**
   * Does this function need to be exported.
   */
  export?: boolean
  /**
   * Does the function has async/promise behaviour.
   * This will also add `Promise<returnType>` as the returnType.
   */
  async?: boolean
  /**
   * Generics that needs to be added for TypeScript.
   */
  generics?: string | string[]

  /**
   * ReturnType(see async for adding Promise type).
   */
  returnType?: string
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
 * Builds a function declaration string for the fsx renderer. Supports optional
 * export/default/async flags, generics, params and JSDoc rendering.
 */
export const Function = createComponent(({ children, ...props }: FunctionProps) => {
  const { name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Function', props })

    provide(NodeTreeContext, childTree)
  }

  const genericsPart = generics ? (Array.isArray(generics) ? generics.join(', ').trim() : generics) : undefined
  const jsdoc = JSDoc?.comments ? createJSDoc({ comments: JSDoc.comments }) : undefined

  if (children) {
    const result = code`${jsdoc ?? ''}${jsdoc ? br : ''}${canExport ? 'export ' : ''}${isDefault ? 'default ' : ''}${async ? 'async ' : ''}function ${name}${genericsPart ? `<${genericsPart}>` : ''}(${params ?? ''})${returnType && !async ? `: ${returnType}` : ''}${returnType && async ? `: Promise<${returnType}>` : ''} {${br}${indent}${children}${dedent}${br}}`

    return Text({ children: result })
  }

  const result = code`${jsdoc ?? ''}${jsdoc ? br : ''}${canExport ? 'export ' : ''}${isDefault ? 'default ' : ''}${async ? 'async ' : ''}function ${name}${genericsPart ? `<${genericsPart}>` : ''}(${params ?? ''})${returnType && !async ? `: ${returnType}` : ''}${returnType && async ? `: Promise<${returnType}>` : ''} {}`

  return Text({ children: result })
}) as ComponentBuilder<FunctionProps> & { Arrow: typeof ArrowFunction }

Function.displayName = 'KubbFunction'

type ArrowFunctionProps = FunctionProps & {
  /**
   * Create Arrow function in one line
   */
  singleLine?: boolean
}

/**
 * ArrowFunction
 *
 * Builds an arrow function declaration string for the fsx renderer. Supports
 * the same options as `Function`. Use `singleLine` to produce a one-line
 * arrow expression.
 */
const ArrowFunction = createComponent(({ children, ...props }: ArrowFunctionProps) => {
  const { name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc, singleLine } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'ArrowFunction', props })

    provide(NodeTreeContext, childTree)
  }

  const genericsPart = generics ? (Array.isArray(generics) ? generics.join(', ').trim() : generics) : undefined
  const jsdoc = JSDoc?.comments ? createJSDoc({ comments: JSDoc.comments }) : undefined

  if (singleLine) {
    const result = code`${jsdoc ?? ''}${jsdoc ? br : ''}${canExport ? 'export ' : ''}${isDefault ? 'default ' : ''}const ${name} = ${async ? 'async ' : ''}${genericsPart ? `<${genericsPart}>` : ''}(${params ?? ''})${returnType && !async ? `: ${returnType}` : ''}${returnType && async ? `: Promise<${returnType}>` : ''} => ${children ?? ''}${br}`
    return Text({ children: result })
  }

  if (children) {
    const result = code`${jsdoc ?? ''}${jsdoc ? br : ''}${canExport ? 'export ' : ''}${isDefault ? 'default ' : ''}const ${name} = ${async ? 'async ' : ''}${genericsPart ? `<${genericsPart}>` : ''}(${params ?? ''})${returnType && !async ? `: ${returnType}` : ''}${returnType && async ? `: Promise<${returnType}>` : ''} => {${br}${indent}${children}${dedent}${br}}${br}`
    return Text({ children: result })
  }

  const result = code`${jsdoc ?? ''}${jsdoc ? br : ''}${canExport ? 'export ' : ''}${isDefault ? 'default ' : ''}const ${name} = ${async ? 'async ' : ''}${genericsPart ? `<${genericsPart}>` : ''}(${params ?? ''})${returnType && !async ? `: ${returnType}` : ''}${returnType && async ? `: Promise<${returnType}>` : ''} => {}${br}`

  return Text({ children: result })
})

ArrowFunction.displayName = 'KubbArrowFunction'
Function.Arrow = ArrowFunction
