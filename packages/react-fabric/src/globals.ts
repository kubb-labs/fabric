import type { KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from './types.ts'
import type React from 'react'

declare module 'react' {
  namespace JSX {
    interface ElementClass extends React.ComponentClass<any> {
      render(): React.ReactNode
    }

    interface ElementAttributesProperty {
      props: {}
    }

    interface ElementChildrenAttribute {
      children: {}
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
