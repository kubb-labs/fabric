/**
 * Main stc wrapper function that creates a string template component
 * 
 * Unlike the previous implementation, this does NOT force components to be async.
 * Components can be plain functions that return strings directly, matching the
 * Alloy framework pattern for simpler, more natural code generation.
 * 
 * @example
 * ```ts
 * import { stc, code } from '@kubb/stc-fabric'
 * 
 * function HelloWorld(props: { name: string }) {
 *   return `Hello, ${props.name}!`
 * }
 * 
 * const HelloWorldStc = stc(HelloWorld)
 * const result = HelloWorldStc({ name: 'World' })
 * // => "Hello, World!" (no await needed!)
 * ```
 */
export function stc<TProps = {}>(component: (props: TProps) => string): (props: TProps) => string {
  return (props: TProps) => {
    return component(props)
  }
}

/**
 * Vue-style component wrapper (alias for stc)
 * Similar to Vue's h() function for creating components
 * 
 * @example
 * ```ts
 * const MyComponent = h(HelloWorld)
 * ```
 */
export const h = stc

/**
 * Tagged template literal helper for inline code generation
 * 
 * @example
 * ```ts
 * const code = template`
 *   const ${name} = ${value};
 * `
 * ```
 */
export function template(strings: TemplateStringsArray, ...values: any[]): string {
  let result = ''
  for (let i = 0; i < strings.length; i++) {
    result += strings[i]
    if (i < values.length) {
      result += String(values[i])
    }
  }
  return result
}

/**
 * Alias for template - represents code generation
 */
export const code = template
