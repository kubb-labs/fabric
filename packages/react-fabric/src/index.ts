// import './globals.ts'
import * as React from 'react'

export type { Fabric } from '@kubb/fabric-core'
// expose fabric core helpers
export { createFabric, createFile, FileManager, FileProcessor } from '@kubb/fabric-core'

// react helpers
export const useState = React.useState
export const createContext = React.createContext
export const createElement = React.createElement
export const Fragment = React.Fragment
export const use = React.use
export const useContext = React.useContext
export const useEffect = React.useEffect
export const useReducer = React.useReducer
export const useRef = React.useRef
// components
export { App } from './components/App.tsx'
export { Const } from './components/Const.tsx'
export { File } from './components/File.tsx'
export { Function } from './components/Function.tsx'
export { Type } from './components/Type.tsx'

// composables
export { useApp } from './composables/useApp.ts'
export { useFile } from './composables/useFile.ts'
export { useLifecycle } from './composables/useLifecycle.tsx'

// factories
export { createReactFabric } from './createReactFabric.ts'
export { openDevtools } from './devtools.ts'
export { Runtime } from './Runtime.tsx'
// utils
export { createFunctionParams, FunctionParams } from './utils/getFunctionParams.ts'
