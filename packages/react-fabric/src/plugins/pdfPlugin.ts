import { definePlugin } from '@kubb/fabric-core/plugins'
import type { DOMElement } from '../types.ts'

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

type ExtendOptions = {
  renderPDF(component: React.ComponentType, file: string): Promise<void>
}

declare global {
  namespace Kubb {
    interface Fabric {
      renderPDF?(component: React.ComponentType, file: string): Promise<void>
    }
  }
}

/**
 * Recursively finds all kubb-pdf nodes in the DOM tree
 */
function findPDFNodes(node: DOMElement): Array<DOMElement> {
  const pdfNodes: Array<DOMElement> = []
  
  function walk(current: DOMElement) {
    for (const child of current.childNodes) {
      if (!child || child.nodeName === '#text') {
        continue
      }
      
      if (child.nodeName === 'kubb-pdf') {
        pdfNodes.push(child)
      } else {
        walk(child)
      }
    }
  }
  
  walk(node)
  return pdfNodes
}

/**
 * PDF plugin that enables react-pdf rendering support
 * This plugin allows generating PDF files using react-pdf components
 * 
 * @example
 * ```tsx
 * import { Document, Page, Text } from '@react-pdf/renderer'
 * import { PDF } from '@kubb/react-fabric'
 * 
 * function App() {
 *   return (
 *     <PDF file="output/report.pdf">
 *       <Document>
 *         <Page>
 *           <Text>Generated with Kubb 🚀</Text>
 *         </Page>
 *       </Document>
 *     </PDF>
 *   )
 * }
 * ```
 */
export const pdfPlugin = definePlugin<Options, ExtendOptions>({
  name: 'pdf',
  install(ctx, options = {}) {
    // Listen for lifecycle:render to process PDF nodes after rendering
    ctx.on('lifecycle:render', async ({ fabric: fabricInstance }) => {
      // Access the runtime's root node to find PDF nodes
      // This will be set by the reactPlugin during rendering
    })
    
    // Listen for files that need PDF rendering
    ctx.on('file:processing:end', async ({ file }) => {
      if (file.path.endsWith('.pdf') && options.onBeforeWrite) {
        await options.onBeforeWrite(file.path)
      }
    })
  },
  inject(fabric, options = {}) {
    return {
      async renderPDF(component, filePath) {
        // Dynamically import react-pdf to avoid hard dependency
        try {
          const { renderToFile } = await import('@react-pdf/renderer')
          const { createElement } = await import('react')
          
          if (!options.dryRun) {
            if (options.onBeforeWrite) {
              await options.onBeforeWrite(filePath)
            }
            
            await renderToFile(createElement(component), filePath)
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
            throw new Error(
              'react-pdf is not installed. Please install it with: npm install @react-pdf/renderer'
            )
          }
          throw error
        }
      },
    }
  },
})
