import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

export const Dedent = createComponent('dedent', () => {
  return createIntrinsic('dedent')
})
Dedent.displayName = 'Dedent'
