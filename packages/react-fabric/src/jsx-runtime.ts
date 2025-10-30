import type { KubbElement, KubbNode } from './types.ts'

export { jsxDEV } from 'react/jsx-dev-runtime'

export { Fragment, jsx, jsxs } from 'react/jsx-runtime'
export type * from './jsx-namespace.d.ts'

export type JSXElement = KubbElement
export type ReactNode = KubbNode
