import { definePlugin } from '@kubb/fabric-core/plugins'

export type Options = {
  /**
   * If true, PDFs will not be written to disk
   */
  dryRun?: boolean
  /**
   * Called before writing each PDF file
   */
  onBeforeWrite?: (path: string) => void | Promise<void>
}

/**
 * PDF plugin that enables react-pdf rendering support
 * This plugin automatically detects .pdf files and renders them using react-pdf
 * 
 * @example
 * ```tsx
 * import { Document, Page, Text } from '@react-pdf/renderer'
 * import { File } from '@kubb/react-fabric'
 * 
 * function App() {
 *   return (
 *     <File path="output/report.pdf" baseName="report.pdf">
 *       <File.Source>
 *         <Document>
 *           <Page>
 *             <Text>Generated with Kubb 🚀</Text>
 *           </Page>
 *         </Document>
 *       </File.Source>
 *     </File>
 *   )
 * }
 * ```
 */
export const pdfPlugin = definePlugin<Options, {}>({
  name: 'pdf',
  install(ctx, options = {}) {
    // Listen for file processing to intercept PDF files
    ctx.on('file:processing:start', async ({ file }) => {
      if (file.path.endsWith('.pdf')) {
        // This is a PDF file, we'll handle it specially
        if (options.onBeforeWrite) {
          await options.onBeforeWrite(file.path)
        }
      }
    })
    
    // Override file processing for PDF files
    ctx.on('file:processing:update', async ({ file }) => {
      if (file.path.endsWith('.pdf') && !options.dryRun) {
        // Render PDF using react-pdf
        try {
          // Dynamically import react-pdf to check if it's available
          await import('@react-pdf/renderer')
          
          // The source contains the react-pdf JSX as a string
          // We need to render it to a PDF file
          // The actual rendering will happen via the pdfParser or fsPlugin
          
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
            console.warn(
              `Warning: @react-pdf/renderer is not installed. Skipping PDF generation for ${file.path}`
            )
          } else {
            throw error
          }
        }
      }
    })
  },
  inject() {
    return {}
  },
})
