import { createJSDoc } from '../utils/createJSDoc.ts'
import { Indent } from './Indent.ts'

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
  let result = ''
  
  if (JSDoc?.comments) {
    result += createJSDoc({ comments: JSDoc.comments })
    result += '\n'
  }
  
  if (canExport) {
    result += 'export '
  }
  
  if (isDefault) {
    result += 'default '
  }
  
  if (async) {
    result += 'async '
  }
  
  result += `function ${name}`
  
  if (generics) {
    result += '<'
    result += Array.isArray(generics) ? generics.join(', ').trim() : generics
    result += '>'
  }
  
  result += `(${params || ''})`
  
  if (returnType && !async) {
    result += `: ${returnType}`
  }
  
  if (returnType && async) {
    result += `: Promise<${returnType}>`
  }
  
  result += ' {\n'
  result += Indent({ size: 2, children })
  result += '\n}'
  
  return result
}

Function.displayName = 'KubbFunction'

type ArrowFunctionProps = Props & {
  /**
   * Create Arrow function in one line
   */
  singleLine?: boolean
}

function ArrowFunction({ name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc, singleLine, children }: ArrowFunctionProps): string {
  let result = ''
  
  if (JSDoc?.comments) {
    result += createJSDoc({ comments: JSDoc.comments })
    result += '\n'
  }
  
  if (canExport) {
    result += 'export '
  }
  
  if (isDefault) {
    result += 'default '
  }
  
  result += `const ${name} = `
  
  if (async) {
    result += 'async '
  }
  
  if (generics) {
    result += '<'
    result += Array.isArray(generics) ? generics.join(', ').trim() : generics
    result += '>'
  }
  
  result += `(${params || ''})`
  
  if (returnType && !async) {
    result += `: ${returnType}`
  }
  
  if (returnType && async) {
    result += `: Promise<${returnType}>`
  }
  
  if (singleLine) {
    result += ` => ${children || ''}\n`
  } else {
    result += ' => {\n'
    result += Indent({ size: 2, children })
    result += '\n}\n'
  }
  
  return result
}

ArrowFunction.displayName = 'KubbArrowFunction'
Function.Arrow = ArrowFunction
