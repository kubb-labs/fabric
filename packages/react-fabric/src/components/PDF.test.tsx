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

  test('renderPDF method exists when pdfPlugin is loaded', async () => {
    const fabric = createFabric()
    fabric.use(pdfPlugin)
    
    expect(fabric.renderPDF).toBeDefined()
    expect(typeof fabric.renderPDF).toBe('function')
  })

  test('renderPDF with dryRun option does not throw', async () => {
    const fabric = createFabric()
    fabric.use(pdfPlugin, { dryRun: true })
    
    const TestComponent = () => <div>Test</div>
    
    // Should not throw when react-pdf is not installed in dryRun mode
    // The function will exit early due to dryRun flag
    await expect(fabric.renderPDF!(TestComponent, 'test.pdf')).resolves.toBeUndefined()
  })

  test('pdfPlugin onBeforeWrite callback is called in dryRun mode', async () => {
    let writtenPath: string | undefined
    
    const fabric = createFabric()
    fabric.use(pdfPlugin, {
      dryRun: true,
      onBeforeWrite: (path) => {
        writtenPath = path
      },
    })
    
    const TestComponent = () => <div>Test</div>
    
    await fabric.renderPDF!(TestComponent, 'output/test.pdf')
    
    expect(writtenPath).toBe('output/test.pdf')
  })

  test('renderPDF with dryRun does not throw', async () => {
    const fabric = createFabric()
    fabric.use(pdfPlugin, { dryRun: true })
    
    const TestComponent = () => <div>Test</div>
    
    // Should not throw in dryRun mode
    await expect(fabric.renderPDF!(TestComponent, 'test.pdf')).resolves.toBeUndefined()
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
