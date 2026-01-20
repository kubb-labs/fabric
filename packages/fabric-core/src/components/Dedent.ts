import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

/**
 * Dedent component for reducing indentation level in rendered output.
 */
export const Dedent = createComponent('dedent', () => {
  return createIntrinsic('dedent')
})
Dedent.displayName = 'Dedent'
