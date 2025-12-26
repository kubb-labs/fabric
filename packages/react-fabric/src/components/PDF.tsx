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
 * This component allows you to embed react-pdf components within Kubb's file generation system.
 * When rendered, it triggers react-pdf's renderToFile to generate a PDF.
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
  return <kubb-pdf file={file}>{children}</kubb-pdf>
}

PDF.displayName = 'KubbPDF'
