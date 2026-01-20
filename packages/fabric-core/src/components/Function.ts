import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { type ComponentBuilder, createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import type { JSDoc } from '../types.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'
import { Br } from './Br.ts'
import { Dedent } from './Dedent.ts'
import { Indent } from './Indent.ts'

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
 * Generates a TypeScript function declaration.
 */
export const Function = createComponent('Function', ({ children, ...props }: FunctionProps) => {
  const { name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Function', props })

    provide(NodeTreeContext, childTree)
  }

  const parts: string[] = []

  if (JSDoc?.comments) {
    parts.push(createJSDoc({ comments: JSDoc.comments }))
    parts.push('\n')
  }

  if (canExport) {
    parts.push('export ')
  }

  if (isDefault) {
    parts.push('default ')
  }

  if (async) {
    parts.push('async ')
  }

  parts.push(`function ${name}`)

  if (generics) {
    parts.push('<')
    parts.push(Array.isArray(generics) ? generics.join(', ').trim() : generics)
    parts.push('>')
  }

  parts.push(`(${params || ''})`)

  if (returnType && !async) {
    parts.push(`: ${returnType}`)
  }

  if (returnType && async) {
    parts.push(`: Promise<${returnType}>`)
  }

  parts.push(' {')

  if (children) {
    return [parts.join(''), Br(), Indent(), children, Br(), Dedent(), '}']
  }

  return [parts.join(''), '}']
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
const ArrowFunction = createComponent('ArrowFunction', ({ children, ...props }: ArrowFunctionProps) => {
  const { name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc, singleLine } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'ArrowFunction', props })

    provide(NodeTreeContext, childTree)
  }

  const parts: string[] = []

  if (JSDoc?.comments) {
    parts.push(createJSDoc({ comments: JSDoc.comments }))
    parts.push('\n')
  }

  if (canExport) {
    parts.push('export ')
  }

  if (isDefault) {
    parts.push('default ')
  }

  parts.push(`const ${name} = `)

  if (async) {
    parts.push('async ')
  }

  if (generics) {
    parts.push('<')
    parts.push(Array.isArray(generics) ? generics.join(', ').trim() : generics)
    parts.push('>')
  }

  parts.push(`(${params || ''})`)

  if (returnType && !async) {
    parts.push(`: ${returnType}`)
  }

  if (returnType && async) {
    parts.push(`: Promise<${returnType}>`)
  }

  if (singleLine) {
    parts.push(` => ${children || ''}\n`)
    return parts.join('')
  }

  if (children) {
    return [parts.join(''), ' => {', Br(), Indent(), children, Br(), Dedent(), '}']
  }

  return [parts.join(''), ' => {}']
})

ArrowFunction.displayName = 'KubbArrowFunction'
Function.Arrow = ArrowFunction
