import type React from 'react'

import type { FabricReactNode, FabricReactElement, FabricExportProps, FabricFileProps, FabricImportProps, FabricSourceProps, FabricTextProps, LineBreakProps } from './types'

export namespace JSX {
  type ElementType = React.JSX.ElementType
  type Element = FabricReactElement

  interface ElementClass extends React.JSX.ElementClass {
    render(): FabricReactNode
  }
  interface ElementAttributesProperty {
    props: {}
  }

  interface ElementChildrenAttribute {
    children: {}
  }

  interface IntrinsicElements extends React.JSX.IntrinsicElements {
    'kubb-text': FabricTextProps
    'kubb-file': FabricFileProps
    'kubb-source': FabricSourceProps
    'kubb-import': FabricImportProps
    'kubb-export': FabricExportProps
    br: LineBreakProps
    indent: {}
    dedent: {}
  }
  type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>
  interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> {}
  interface IntrinsicElements extends React.JSX.IntrinsicElements {}
}
