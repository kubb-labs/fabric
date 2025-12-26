import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { pdfPlugin } from '../plugins/pdfPlugin.ts'
import { File } from './File.tsx'

describe('PDF support with File component', () => {
  test('render File with PDF extension', async () => {
    const Component = () => {
      return (
        <File path="output/test.pdf" baseName="test.pdf">
          <File.Source>
            {/* PDF content would go here */}
          </File.Source>
        </File>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    await fabric.render(Component)
    const files = fabric.files

    // File component should create a file entry
    expect(files.length).toBe(1)
    expect(files[0]?.path).toBe('output/test.pdf')
    expect(files[0]?.baseName).toBe('test.pdf')
  })

  test('File with PDF extension has correct properties', async () => {
    const Component = () => {
      return (
        <File path="output/report.pdf" baseName="report.pdf">
          <File.Source>
            <div>Page 1</div>
            <div>Page 2</div>
          </File.Source>
        </File>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    await fabric.render(Component)
    const files = fabric.files

    expect(files.length).toBe(1)
    expect(files[0]?.extname).toBe('.pdf')
  })

  test('pdfPlugin with onBeforeWrite callback', async () => {
    const Component = () => {
      return (
        <File path="output/test.pdf" baseName="test.pdf">
          <File.Source>
            <div>Test content</div>
          </File.Source>
        </File>
      )
    }
    
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin, {
      onBeforeWrite: () => {
        // Callback for testing
      },
    })
    
    await fabric.render(Component)
    const files = fabric.files
    
    // File should be created
    expect(files.length).toBe(1)
    expect(files[0]?.path).toBe('output/test.pdf')
  })

  test('multiple PDF files in one render', async () => {
    const Component = () => {
      return (
        <>
          <File path="output/report1.pdf" baseName="report1.pdf">
            <File.Source>
              <div>Report 1</div>
            </File.Source>
          </File>
          <File path="output/report2.pdf" baseName="report2.pdf">
            <File.Source>
              <div>Report 2</div>
            </File.Source>
          </File>
        </>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    await fabric.render(Component)
    const files = fabric.files

    expect(files.length).toBe(2)
    expect(files[0]?.path).toBe('output/report1.pdf')
    expect(files[1]?.path).toBe('output/report2.pdf')
  })

  test('PDF file mixed with regular TypeScript file', async () => {
    const Component = () => {
      return (
        <>
          <File baseName="index.ts" path="output/index.ts">
            <File.Source>export const version = "1.0.0"</File.Source>
          </File>
          <File baseName="docs.pdf" path="output/docs.pdf">
            <File.Source>
              <div>Documentation</div>
            </File.Source>
          </File>
        </>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    await fabric.render(Component)
    const files = fabric.files

    // Should have both files - TypeScript and PDF
    expect(files.length).toBe(2)
    // Files may be in any order depending on implementation
    const tsFile = files.find(f => f.baseName === 'index.ts')
    const pdfFile = files.find(f => f.baseName === 'docs.pdf')
    expect(tsFile).toBeDefined()
    expect(pdfFile).toBeDefined()
  })
})
