import type React from 'react'
import type {
  FabricExportProps,
  FabricFileProps,
  FabricImportProps,
  FabricReactElement,
  FabricReactNode,
  FabricSourceProps,
  FabricTextProps,
  LineBreakProps,
} from './types.ts'

declare global {
  namespace JSX {
    type Element = FabricReactElement

    interface ElementClass extends React.ComponentClass<any> {
      render(): FabricReactNode
    }

    interface IntrinsicElements {
      'kubb-text': FabricTextProps
      'kubb-file': FabricFileProps
      'kubb-source': FabricSourceProps
      'kubb-import': FabricImportProps
      'kubb-export': FabricExportProps
      br: LineBreakProps
      indent: {}
      dedent: {}
    }
  }
}
