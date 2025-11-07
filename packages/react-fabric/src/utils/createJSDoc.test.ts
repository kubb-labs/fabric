import { createJSDoc } from './createJSDoc.ts'

describe('createJsDoc', () => {
  test('comments should be converted to jsdocs', () => {
    expect(createJSDoc({ comments: [] })).toBe('')
    expect(createJSDoc({ comments: ['test'] })).toBe('/**\n * test\n */')
    expect(createJSDoc({ comments: ['foo', '', 'bar'] })).toBe('/**\n * foo\n * bar\n */')
    expect(createJSDoc({ comments: ['', ''] })).toBe('')
  })
})
