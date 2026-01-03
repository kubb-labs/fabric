import { createJSDoc } from '../utils/createJSDoc.ts'

type JSDoc = { comments: Array<string> }

type Props = {
  /**
   * Name of the const
   */
  name: string
  /**
   * Does this type need to be exported.
   */
  export?: boolean
  /**
   * Type to make the const being typed
   */
  type?: string
  /**
   * Options for JSdocs.
   */
  JSDoc?: JSDoc
  /**
   * Use of `const` assertions
   */
  asConst?: boolean
  children?: string
}

export function Const({ name, export: canExport, type, JSDoc, asConst, children }: Props): string {
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

  result += ` = ${children || ''}`

  if (asConst) {
    result += ' as const'
  }

  return result
}

Const.displayName = 'KubbConst'
