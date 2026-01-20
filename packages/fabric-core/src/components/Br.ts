import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

export const Br = createComponent('br', () => {
  return createIntrinsic('br')
})

Br.displayName = 'Br'
