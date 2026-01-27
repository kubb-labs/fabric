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
   * Export with default keyword.
   * - `true` generates `export default function`
   * - `false` generates named export or no export
   * @default false
   */
  default?: boolean
  /**
   * Function parameters.
   *
   * @example 'id: number, name: string'
   */
  params?: string
  /**
   * Export this function.
   * - `true` generates `export function`
   * - `false` generates internal function
   * @default false
   */
  export?: boolean
  /**
   * Make the function async.
   * - `true` adds async keyword and wraps return type in Promise
   * - `false` generates synchronous function
   * @default false
   */
  async?: boolean
  /**
   * TypeScript generics.
   *
   * @example 'T' or ['T', 'U']
   */
  generics?: string | string[]
  /**
   * Return type of the function.
   *
   * When async is true, this is automatically wrapped in Promise.
   */
  returnType?: string
  /**
   * JSDoc comments for the function.
   */
  JSDoc?: JSDoc
  /**
   * Function body.
   */
  children?: FabricNode
}

/**
 * Generates a TypeScript function declaration.
 *
 * @example
 * ```tsx
 * <Function
 *   name="getUser"
 *   export
 *   async
 *   params="id: number"
 *   returnType="User"
 * >
 *   return fetch(`/users/${id}`).then(r => r.json())
 * </Function>
 * ```
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

Function.displayName = 'Function'

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

ArrowFunction.displayName = 'ArrowFunction'
Function.Arrow = ArrowFunction
