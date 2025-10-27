import './globals.ts'

import * as React from 'react'

// components
export { App } from './components/App.tsx'
export { Const } from './components/Const.tsx'
export { File } from './components/File.tsx'
export { Function } from './components/Function.tsx'
export { Indent } from './components/Indent.tsx'
export { Type } from './components/Type.tsx'

export { useApp } from './composables/useApp.ts'
export { useFile } from './composables/useFile.ts'
export { useLifecycle } from './composables/useLifecycle.tsx'

// expose fabric core helpers
export { createFabric } from '@kubb/fabric-core'
export { createReactFabric } from './createReactFabric.ts'

// utils
export { createFunctionParams, FunctionParams } from './utils/getFunctionParams.ts'
export { Runtime } from './Runtime.tsx'

// react helpers
export const createContext = React.createContext
export const createElement = React.createElement
export const useContext = React.useContext
export const useEffect = React.useEffect
export const useState = React.useState
export const useRef = React.useRef
export const use = React.use
export const useReducer = React.useReducer
