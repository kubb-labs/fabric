import type { KubbNode, KubbElement, KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from './types.ts'
import type React from 'react'

declare global {
  namespace JSX {
    type Element = KubbElement

    interface ElementClass extends React.ComponentClass<any> {
      render(): KubbNode
    }

    interface IntrinsicElements {
      'kubb-text': KubbTextProps
      'kubb-file': KubbFileProps
      'kubb-source': KubbSourceProps
      'kubb-import': KubbImportProps
      'kubb-export': KubbExportProps
      br: LineBreakProps
    }
  }
}
