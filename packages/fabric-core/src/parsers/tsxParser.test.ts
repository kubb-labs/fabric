import type * as KubbFile from '../KubbFile.ts'
import { tsxParser } from './tsxParser.ts'

describe('tsxParser', () => {
  test('should parse TSX file with JSX syntax', async () => {
    const file: KubbFile.ResolvedFile = {
      id: 'test-component',
      path: '/project/src/Component.tsx',
      baseName: 'Component.tsx',
      name: 'Component',
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
    }

    const output = await tsxParser.parse(file, { extname: '.tsx' })
    
    expect(output).toContain('// Component banner')
    expect(output).toContain('import React from "react"')
    expect(output).toContain('export const MyComponent = () => <div>Hello</div>')
    expect(output).toContain('// Component footer')
  })

  test('should handle TSX file with default extname', async () => {
    const file: KubbFile.ResolvedFile = {
      id: 'test-app',
      path: '/project/src/App.tsx',
      baseName: 'App.tsx',
      name: 'App',
      extname: '.tsx',
      sources: [
        { value: 'const App = () => <h1>App</h1>' },
      ],
      imports: [],
      exports: [],
      meta: {},
    }

    const output = await tsxParser.parse(file, { extname: '.tsx' })
    
    expect(output).toContain('const App = () => <h1>App</h1>')
  })
})
