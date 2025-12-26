import path from 'node:path'
import { createReactFabric, PDF } from '@kubb/react-fabric'
import { pdfPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

/**
 * PDF Generation Example
 * 
 * This example demonstrates how to use the PDF plugin with react-pdf
 * to generate PDF files alongside regular code files.
 * 
 * Note: This example requires @react-pdf/renderer to be installed:
 * npm install @react-pdf/renderer
 */

async function start() {
  // Example 1: Using the PDF component with react-pdf
  // This will work when @react-pdf/renderer is installed
  function AppWithPDF() {
    // Dynamic import to avoid hard dependency
    // In a real app, you would import these at the top level
    return (
      <PDF file={path.resolve(__dirname, 'gen/report.pdf')}>
        {/* 
          Here you would place react-pdf components:
          
          <Document>
            <Page>
              <Text>Generated with Kubb 🚀</Text>
            </Page>
          </Document>
        */}
        <></>
      </PDF>
    )
  }

  const fabric = createReactFabric()

  fabric.use(pdfPlugin, {
    dryRun: false,
    onBeforeWrite: (path) => {
      console.log('About to write PDF:', path)
    },
  })
  fabric.use(reactPlugin)

  console.log('\n🔧 PDF Plugin Example')
  console.log('━'.repeat(50))
  console.log('\nNote: Install @react-pdf/renderer to enable PDF generation:')
  console.log('  npm install @react-pdf/renderer\n')
  
  // Example 2: Using renderPDF directly
  if (fabric.renderPDF) {
    console.log('✓ PDF plugin is loaded and ready')
    console.log('  Use fabric.renderPDF(Component, "path.pdf") to generate PDFs\n')
  }

  // Render the app
  await fabric.render(AppWithPDF)
  
  console.log('━'.repeat(50))
  console.log('✓ Example completed\n')
}

start()
