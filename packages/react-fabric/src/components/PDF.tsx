import { useEffect } from 'react'
import type { Key, KubbNode } from '../types.ts'

type Props = {
  key?: Key
  /**
   * Path where the PDF file will be written
   */
  file: string
  /**
   * React-PDF Document component tree
   */
  children?: KubbNode
}

/**
 * PDF component that bridges Kubb with react-pdf
 * 
 * This component uses useEffect to dynamically import react-pdf and render
 * the PDF file directly from the React component tree.
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
export function PDF({ children, file }: Props) {
  useEffect(() => {
    // Dynamically import and render PDF
    import('@react-pdf/renderer').then(({ renderToFile }) => {
      // Render the children to a PDF file
      renderToFile(children as React.ReactElement, file).catch((error) => {
        console.error(`Failed to generate PDF ${file}:`, error)
      })
    })
  }, [children, file])
  
  // Return null - this component doesn't render anything visible
  return null
}

PDF.displayName = 'KubbPDF'
