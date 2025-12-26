import path from 'node:path'
import { createReactFabric, File } from '@kubb/react-fabric'
import { pdfPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

/**
 * PDF Generation Example
 * 
 * This example demonstrates how to use the PDF plugin with react-pdf
 * to generate PDF files alongside regular code files using File and File.Source.
 * 
 * Note: This example requires @react-pdf/renderer to be installed:
 * npm install @react-pdf/renderer
 */

async function start() {
  // Example: Using File and File.Source with react-pdf
  // This will work when @react-pdf/renderer is installed
  function AppWithPDF() {
    const pdfPath = path.resolve(__dirname, 'gen/report.pdf')
    
    return (
      <File path={pdfPath} baseName="report.pdf">
        <File.Source>
          {/* 
            Here you would place react-pdf components:
            
            <Document>
              <Page>
                <Text>Generated with Kubb 🚀</Text>
              </Page>
            </Document>
          */}
        </File.Source>
      </File>
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
  
  console.log('✓ PDF plugin is loaded and ready')
  console.log('  Use File component with .pdf extension to generate PDFs\n')

  // Render the app
  await fabric.render(AppWithPDF)
  
  console.log('━'.repeat(50))
  console.log('✓ Example completed\n')
}

start()
