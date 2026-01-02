import { createJSDoc } from '../utils/createJSDoc.ts'

type JSDoc = { comments: Array<string> }

type Props = {
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
  children?: string
}

export function Type({ name, export: canExport, JSDoc, children }: Props): string {
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
}

Type.displayName = 'KubbType'
