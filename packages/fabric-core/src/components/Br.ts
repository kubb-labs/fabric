import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

/**
 * Generates a line break in the output.
 */
export const Br = createComponent('br', () => {
  return createIntrinsic('br')
})

Br.displayName = 'Br'
