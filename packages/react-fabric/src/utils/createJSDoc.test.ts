import { createJSDoc } from './createJSDoc.ts'

describe('createJsDoc', () => {
  test('should convert comments to JSDoc format', () => {
    expect(createJSDoc({ comments: [] })).toBe('')
    expect(createJSDoc({ comments: ['test'] })).toBe('/**\n * test\n */')
    expect(createJSDoc({ comments: ['foo', '', 'bar'] })).toBe('/**\n * foo\n * bar\n */')
    expect(createJSDoc({ comments: ['', ''] })).toBe('')
  })
})
