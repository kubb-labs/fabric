import * as React from 'react/jsx-runtime'
import type { KubbElement, KubbNode } from './types.ts'

export const Fragment = React.Fragment
export const jsx = React.jsx
export const jsxDEV = React.jsx
export const jsxs = React.jsxs

export type * from './jsx-namespace.d.ts'

export type JSXElement = KubbElement
export type ReactNode = KubbNode
