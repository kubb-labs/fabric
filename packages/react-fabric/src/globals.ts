import type { KubbElement, KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from './types.ts'
import type React from 'react'
import type { KubbNode } from '@kubb/react-fabric/types'

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
