import { createJSDoc } from './createJSDoc.ts'

describe('createJsDoc', () => {
  test('comments should be converted to jsdocs', () => {
    expect(createJSDoc({ comments: [] })).toBe('')
    expect(createJSDoc({ comments: ['test'] })).toBe('/**\n * test\n */')
  })
})
