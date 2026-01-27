import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { JSX, ReactNode } from 'react'

export type Key = string | number | bigint

export type ElementNames =
  | 'br'
  | 'div'
  | 'indent'
  | 'dedent'
  | 'kubb-text'
  | 'kubb-file'
  | 'kubb-source'
  | 'kubb-import'
  | 'kubb-export'
  | 'kubb-root'
  | 'kubb-app'

type Node = {
  parentNode: DOMElement | undefined
  internal_static?: boolean
}

export type DOMNodeAttribute = boolean | string | number

type TextName = '#text'
export type TextNode = {
  nodeName: TextName
  nodeValue: string
} & Node

export type DOMNode<T = { nodeName: NodeNames }> = T extends {
  nodeName: infer U
}
  ? U extends '#text'
    ? TextNode
    : DOMElement
  : never

type OutputTransformer = (s: string, index: number) => string

export type DOMElement = {
  nodeName: ElementNames
  attributes: Map<string, DOMNodeAttribute>
  childNodes: DOMNode[]
  internal_transform?: OutputTransformer

  // Internal properties
  isStaticDirty?: boolean
  staticNode?: DOMElement
  onComputeLayout?: () => void
  onRender?: () => void
  onImmediateRender?: () => void
} & Node

type NodeNames = ElementNames | TextName

export type FabricReactNode = ReactNode
export type FabricReactElement = JSX.Element

export type FabricTextProps = {
  children?: FabricReactNode
}

export type FabricFileProps = {
  id?: string
  children?: FabricReactNode
  baseName: string
  path: string
  override?: boolean
  meta?: KubbFile.File['meta']
}
export type FabricSourceProps = KubbFile.Source & {
  children?: FabricReactNode
}

export type FabricImportProps = KubbFile.Import

export type FabricExportProps = KubbFile.Export

export type LineBreakProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>

export * from '@kubb/fabric-core/types'
export type { Param, Params } from './utils/getFunctionParams.ts'
