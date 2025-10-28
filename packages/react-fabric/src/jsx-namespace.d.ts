import type React from 'react'
import type { KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from '@kubb/react-fabric/types'

export namespace JSX {
  type Element = React.ReactNode

  interface ElementClass extends React.ComponentClass<any> {
    render(): React.ReactNode
  }

  interface ElementAttributesProperty {
    props: {}
  }

  interface ElementChildrenAttribute {
    children: {}
  }

  interface IntrinsicElements extends React.JSX.IntrinsicElements {
    'kubb-text': KubbTextProps
    'kubb-file': KubbFileProps
    'kubb-source': KubbSourceProps
    'kubb-import': KubbImportProps
    'kubb-export': KubbExportProps
    br: LineBreakProps
  }
}
