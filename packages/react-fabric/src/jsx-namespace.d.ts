import type React from 'react'
import type { KubbNode, KubbElement } from './types.ts'

import type { KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from '@kubb/react-fabric/types'

export namespace JSX {
  type Element = KubbElement

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
