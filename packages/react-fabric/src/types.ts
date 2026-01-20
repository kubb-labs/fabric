import type { KubbFile } from '@kubb/fabric-core/types'
import type React from 'react'
import type { JSX, ReactNode } from 'react'

type ReactElementNames = 'br' | 'div' | 'indent' | 'dedent'

export type ElementNames = ReactElementNames | 'kubb-text' | 'kubb-file' | 'kubb-source' | 'kubb-import' | 'kubb-export' | 'kubb-root' | 'kubb-app'

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

export type KubbNode = ReactNode
export type KubbElement = JSX.Element

export type { Key } from 'react'

export type KubbTextProps = {
  children?: KubbNode
}

export type KubbFileProps = {
  id?: string
  children?: KubbNode
  baseName: string
  path: string
  override?: boolean
  meta?: KubbFile.File['meta']
}
export type KubbSourceProps = KubbFile.Source & {
  children?: KubbNode
}

export type KubbImportProps = KubbFile.Import

export type KubbExportProps = KubbFile.Export

export type LineBreakProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>

export * from '@kubb/fabric-core/types'
export type { Param, Params } from './utils/getFunctionParams.ts'
