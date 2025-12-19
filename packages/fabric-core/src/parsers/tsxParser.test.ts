import { tsxParser } from './tsxParser.ts'

describe('tsxParser', () => {
  test('should parse TSX file with JSX syntax', async () => {
    const file = {
      path: '/project/src/Component.tsx',
      extname: '.tsx',
      banner: '// Component banner',
      footer: '// Component footer',
      sources: [
        { value: 'export const MyComponent = () => <div>Hello</div>' },
      ],
      imports: [
        { name: 'React', path: 'react' },
      ],
      exports: [],
      meta: {},
    } as any

    const output = await tsxParser.parse(file, { extname: '.tsx' as any })
    
    expect(output).toContain('// Component banner')
    expect(output).toContain('import React from "react"')
    expect(output).toContain('export const MyComponent = () => <div>Hello</div>')
    expect(output).toContain('// Component footer')
  })

  test('should handle TSX file with default extname', async () => {
    const file = {
      path: '/project/src/App.tsx',
      extname: '.tsx',
      sources: [
        { value: 'const App = () => <h1>App</h1>' },
      ],
      imports: [],
      exports: [],
      meta: {},
    } as any

    const output = await tsxParser.parse(file, { extname: '.tsx' as any })
    
    expect(output).toContain('const App = () => <h1>App</h1>')
  })
})
