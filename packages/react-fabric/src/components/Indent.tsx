import type { KubbElement } from '@kubb/react-fabric/types'
import dedent from 'dedent'
import indentString from 'indent-string'
import React from 'react'

type IndentProps = {
  size?: number
  children?: React.ReactNode
}

/**
 * Indents all children by `size` spaces.
 * Collapses consecutive <br /> tags to at most 2.
 *
 * Indent will dedent and re-indent string children and will prefix
 * non-string children with the requested number of spaces.
 */
export function Indent({ size = 2, children }: IndentProps): KubbElement {
  if (!children) {
    return <></>
  }

  const childrenArray = React.Children.toArray(children)
  const result: React.ReactNode[] = []

  let prevWasBr = false
  let brCount = 0

  for (const child of childrenArray) {
    if (React.isValidElement(child) && child.type === 'br') {
      if (!prevWasBr || brCount < 2) {
        result.push(child)
        brCount++
      }
      prevWasBr = true
    } else {
      prevWasBr = false
      brCount = 0
      result.push(child)
    }
  }

  return (
    <>
      {result.map((child) => {
        if (typeof child === 'string') {
          const cleaned = dedent(child)
          return <>{indentString(cleaned, size)}</>
        }
        return (
          <>
            {' '.repeat(size)}
            {child}
          </>
        )
      })}
    </>
  )
}
