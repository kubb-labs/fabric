import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test, vi } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { pdfPlugin } from '../plugins/pdfPlugin.ts'
import { PDF } from './PDF.tsx'

describe('<PDF/>', () => {
  test('render PDF component', async () => {
    const Component = () => {
      return (
        <PDF file="output/test.pdf">
          {/* PDF content would go here */}
        </PDF>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    const output = await fabric.renderToString(Component)

    // PDF component should not render to string output
    expect(output).toMatchInlineSnapshot(`""`)
  })

  test('PDF component with multiple children', async () => {
    const Component = () => {
      return (
        <PDF file="output/report.pdf">
          <div>Page 1</div>
          <div>Page 2</div>
        </PDF>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`""`)
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

  test('renderPDF throws error when react-pdf is not installed and dryRun is false', async () => {
    const fabric = createFabric()
    fabric.use(pdfPlugin, { dryRun: false })
    
    const TestComponent = () => <div>Test</div>
    
    // Should throw an error when react-pdf is not installed
    await expect(fabric.renderPDF!(TestComponent, 'test.pdf')).rejects.toThrow()
  })

  test('multiple PDF components in one render', async () => {
    const Component = () => {
      return (
        <>
          <PDF file="output/report1.pdf">
            <div>Report 1</div>
          </PDF>
          <PDF file="output/report2.pdf">
            <div>Report 2</div>
          </PDF>
        </>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`""`)
  })

  test('PDF component mixed with File component', async () => {
    const { File } = await import('./File.tsx')
    
    const Component = () => {
      return (
        <>
          <File baseName="index.ts" path="output/index.ts">
            <File.Source>export const version = "1.0.0"</File.Source>
          </File>
          <PDF file="output/docs.pdf">
            <div>Documentation</div>
          </PDF>
        </>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(pdfPlugin)
    
    await fabric.render(Component)
    const files = fabric.files

    // Should only have the File component, not the PDF
    expect(files.length).toBe(1)
    expect(files[0]?.baseName).toBe('index.ts')
  })
})
