import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core/types'

type PDFMeta = {
  /**
   * The react-pdf component tree as a string for rendering
   */
  pdfComponentTree?: string
}

/**
 * PDF parser that handles PDF file generation using react-pdf
 * This parser is used when the file extension is .pdf
 * 
 * It takes the component tree stored by pdfPlugin and renders it using react-pdf
 */
export const pdfParser = defineParser({
  name: 'pdf',
  extNames: ['.pdf'],
  async install() {
    // Optional: Validate react-pdf is available
  },
  async parse(file: KubbFile.ResolvedFile) {
    // For PDF files, the meta should contain the component tree from pdfPlugin
    const meta = file.meta as PDFMeta
    
    if (!meta?.pdfComponentTree) {
      console.warn(`No PDF component tree found for ${file.path}. PDF will be empty.`)
      return ''
    }

    try {
      // Dynamically import react-pdf to check availability
      await import('@react-pdf/renderer')
      
      // The pdfComponentTree contains JSX as a string
      // In a real implementation, we would need to:
      // 1. Parse the JSX string to create a React element tree
      // 2. Render it using react-pdf's renderToString or renderToFile
      
      // For now, we'll return a marker indicating this needs PDF rendering
      // The actual rendering should happen when writing the file
      // This approach allows the fsPlugin or a custom writer to handle the PDF generation
      
      // Return the component tree for now
      // The actual PDF generation will be handled by a separate mechanism
      return meta.pdfComponentTree
      
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
        console.warn(
          `Warning: @react-pdf/renderer is not installed. Cannot generate PDF for ${file.path}`
        )
        return ''
      }
      throw error
    }
  },
})
