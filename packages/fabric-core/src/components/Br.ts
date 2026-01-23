import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

/**
 * Generates a line break in the output.
 *
 * Use this component to add newlines in generated code.
 *
 * @example
 * ```tsx
 * <>
 *   const x = 1
 *   <Br />
 *   const y = 2
 * </>
 * ```
 */
export const Br = createComponent('br', () => {
  return createIntrinsic('br')
})

Br.displayName = 'Br'
