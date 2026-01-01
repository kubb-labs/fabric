import type { StcComponent } from './types.ts'

/**
 * Main stc wrapper function that creates a string template component
 * 
 * Note: This function normalizes both sync and async components to always return
 * a Promise, providing a consistent API for callers. This is intentional to
 * simplify usage in code generation scenarios.
 * 
 * @example
 * ```ts
 * import { stc } from '@kubb/fabric-core/stc'
 * 
 * function HelloWorld(props: { name: string }) {
 *   return `Hello, ${props.name}!`
 * }
 * 
 * const HelloWorldStc = stc(HelloWorld)
 * const result = await HelloWorldStc({ name: 'World' })
 * // => "Hello, World!"
 * ```
 */
export function stc<TProps = {}>(component: StcComponent<TProps>): StcComponent<TProps> {
  return async (props: TProps) => {
    const result = await component(props)
    return result
  }
}

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
