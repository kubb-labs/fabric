import { br, dedent, indent } from '../intrinsic.ts'
import { code } from '../fsx.ts'
import { createJSDoc } from '../utils/createJSDoc.ts'

type JSDoc = { comments: Array<string> }

type Props = {
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
  children?: string
}

export function Function({ name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc, children }: Props): string {
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
    return code`${parts.join('')}${indent}${br}${children}${dedent}${br}}`
  }

  return `${parts.join('')}}`
}

Function.displayName = 'KubbFunction'

type ArrowFunctionProps = Props & {
  /**
   * Create Arrow function in one line
   */
  singleLine?: boolean
}

function ArrowFunction({
  name,
  default: isDefault,
  export: canExport,
  async,
  generics,
  params,
  returnType,
  JSDoc,
  singleLine,
  children,
}: ArrowFunctionProps): string {
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
    return code`${parts.join('')} => {${indent}${br}${children}${dedent}${br}}${br}`
  }

  return `${parts.join('')} => {}\n`
}

ArrowFunction.displayName = 'KubbArrowFunction'
Function.Arrow = ArrowFunction
