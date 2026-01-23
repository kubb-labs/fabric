import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

/**
 * Increases indentation level in the output.
 *
 * Use this component to add indentation for nested code blocks.
 * Typically paired with Dedent to control indentation levels.
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
export const Indent = createComponent('indent', () => {
  return createIntrinsic('indent')
})
Indent.displayName = 'Indent'
