import { createComponent } from '../createComponent.ts'
import { createIntrinsic } from '../intrinsic.ts'

export const Indent = createComponent('indent', () => {
  return createIntrinsic('indent')
})
Indent.displayName = 'Indent'
