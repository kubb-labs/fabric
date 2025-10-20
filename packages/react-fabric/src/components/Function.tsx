import type { JSDoc, Key, KubbNode } from '../types.ts'
import { Indent } from './Indent.tsx'
import { createJSDoc } from '../utils/createJSDoc.ts'

type Props = {
  key?: Key
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
  children?: KubbNode
}

export function Function({ name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc, children }: Props) {
  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      {isDefault && <>default </>}
      {async && <>async </>}
      function {name}
      {generics && (
        <>
          {'<'}
          {Array.isArray(generics) ? generics.join(', ').trim() : generics}
          {'>'}
        </>
      )}
      ({params}){returnType && !async && <>: {returnType}</>}
      {returnType && async && (
        <>
          : Promise{'<'}
          {returnType}
          {'>'}
        </>
      )}
      {' {'}
      <br />
      <Indent size={2}>{children}</Indent>
      <br />
      {'}'}
    </>
  )
}

Function.displayName = 'KubbFunction'

type ArrowFunctionProps = Props & {
  /**
   * Create Arrow function in one line
   */
  singleLine?: boolean
}

function ArrowFunction({ name, default: isDefault, export: canExport, async, generics, params, returnType, JSDoc, singleLine, children }: ArrowFunctionProps) {
  return (
    <>
      {JSDoc?.comments && (
        <>
          {createJSDoc({ comments: JSDoc?.comments })}
          <br />
        </>
      )}
      {canExport && <>export </>}
      {isDefault && <>default </>}
      const {name} = {async && <>async </>}
      {generics && (
        <>
          {'<'}
          {Array.isArray(generics) ? generics.join(', ').trim() : generics}
          {'>'}
        </>
      )}
      ({params}){returnType && !async && <>: {returnType}</>}
      {returnType && async && (
        <>
          : Promise{'<'}
          {returnType}
          {'>'}
        </>
      )}
      {singleLine && (
        <>
          {' => '}
          {children}
          <br />
        </>
      )}
      {!singleLine && (
        <>
          {' => {'}
          <br />
          <Indent size={2}>{children}</Indent>
          <br />
          {'}'}
          <br />
        </>
      )}
    </>
  )
}

ArrowFunction.displayName = 'KubbArrowFunction'
Function.Arrow = ArrowFunction
