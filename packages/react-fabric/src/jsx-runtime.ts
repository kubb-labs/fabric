import type { KubbElement, KubbNode } from './types.ts'

export type * from './jsx-namespace.d.ts'

export { Fragment, jsx, jsxs } from 'react/jsx-runtime'

export type JSXElement = KubbElement
export type ReactNode = KubbNode
