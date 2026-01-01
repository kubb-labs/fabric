/**
 * String Template Components (stc)
 * 
 * A signal-based component model for code generation without React dependency.
 * Inspired by the Alloy framework (https://alloy-framework.github.io/alloy/)
 * 
 * @example
 * ```ts
 * import { stc, code, createContext, useContext } from '@kubb/fabric-core/stc'
 * 
 * const ThemeContext = createContext({ color: 'blue' })
 * 
 * function Component(props: { name: string }) {
 *   const theme = useContext(ThemeContext)
 *   return code`const ${props.name} = "${theme.color}"`
 * }
 * 
 * const MyComponent = stc(Component)
 * const result = await MyComponent({ name: 'myVar' })
 * // => 'const myVar = "blue"'
 * ```
 */

export { code, stc, template } from './stc.ts'
export { createContext, useContext } from './context.ts'
export { clearReferences, createReference, getReference } from './reference.ts'
export { createSignal } from './signal.ts'
export type { StcComponent, StcContext, StcReference, StcSignal } from './types.ts'
