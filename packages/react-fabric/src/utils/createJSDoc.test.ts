import { describe, expect, it } from 'vitest'
import { createJSDoc } from './createJSDoc.ts'

describe('createJsDoc', () => {
  it('should convert comments to JSDoc format', () => {
    expect(createJSDoc({ comments: [] })).toMatchInlineSnapshot(`""`)
    expect(createJSDoc({ comments: ['test'] })).toMatchInlineSnapshot(`
      "/**
       * test
       */"
    `)
    expect(createJSDoc({ comments: ['foo', '', 'bar'] })).toMatchInlineSnapshot(`
      "/**
       * foo
       * bar
       */"
    `)
    expect(createJSDoc({ comments: ['', ''] })).toMatchInlineSnapshot(`""`)
  })
})
