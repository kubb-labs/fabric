import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

/**
 * Decreases indentation level in the output.
 *
 * Use this component to reduce indentation after an indented code block.
 * Typically paired with Indent to control indentation levels.
 *
 * @example
 * ```tsx
 * <>
 *   function example() {'{'}<Br />
 *   <Indent />
 *     return true<Br />
 *   <Dedent />
 *   {'}'}
 * </>
 * ```
 */
export const Dedent = createComponent('dedent', () => {
  return createIntrinsic('dedent')
})
Dedent.displayName = 'Dedent'
