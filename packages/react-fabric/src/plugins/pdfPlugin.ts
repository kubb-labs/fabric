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

type PDFMeta = {
  /**
   * The react-pdf component tree as a string for rendering
   */
  pdfComponentTree?: string
}

/**
 * PDF plugin that enables react-pdf rendering support
 * This plugin automatically detects .pdf files and stores their component tree
 * for the pdfParser to render using react-pdf
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
    // Store PDF component trees for later rendering
    const pdfComponentTrees = new Map<string, string>()
    
    // Listen for file processing to intercept PDF files
    ctx.on('file:processing:start', async (file) => {
      if (file.path.endsWith('.pdf')) {
        // This is a PDF file, we'll handle it specially
        if (options.onBeforeWrite) {
          await options.onBeforeWrite(file.path)
        }
        
        // Store the component tree from sources
        // The sources contain the react-pdf JSX as strings
        const componentTree = file.sources.map((source) => source.value).join('\n')
        pdfComponentTrees.set(file.path, componentTree)
        
        // Add to file meta for parser to access
        if (!file.meta) {
          file.meta = {}
        }
        (file.meta as PDFMeta).pdfComponentTree = componentTree
      }
    })
    
    // Check if react-pdf is available
    ctx.on('file:processing:update', async ({ file }) => {
      if (file.path.endsWith('.pdf') && !options.dryRun) {
        // Verify react-pdf is available
        try {
          await import('@react-pdf/renderer')
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
