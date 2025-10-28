import type { KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from './types.ts'
import type React from 'react'
import type { KubbNode } from '@kubb/react-fabric/types'

declare module 'react' {
  namespace JSX {
    interface ElementClass extends React.ComponentClass<any> {
      render(): KubbNode
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
