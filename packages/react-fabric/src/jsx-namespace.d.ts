import type React from 'react'

import type { KubbNode, KubbElement, KubbExportProps, KubbFileProps, KubbImportProps, KubbSourceProps, KubbTextProps, LineBreakProps } from './types'

export namespace JSX {
  type ElementType = React.JSX.ElementType
  type Element = KubbElement

  interface ElementClass extends React.JSX.ElementClass {
    render(): KubbNode
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
    indent: {}
    dedent: {}
  }
  type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>
  interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> {}
  interface IntrinsicElements extends React.JSX.IntrinsicElements {}
}
