import { type Intrinsic, isIntrinsic, renderIntrinsics } from './intrinsic.ts'

export type Children = string | number | boolean | null | undefined | Intrinsic | Children[]

export type ComponentDefinition<T> = (props: T) => string

export type ComponentCreator<T> = {
  (): string
  component: ComponentDefinition<T>
  props: T
}

export type MakeChildrenOptional<T extends object> = T extends { children?: any } ? Omit<T, 'children'> & Partial<Pick<T, 'children'>> : T

export type StcSignature<T extends {}> = (
  ...args: unknown extends T ? [] : {} extends Omit<T, 'children'> ? [props?: MakeChildrenOptional<T>] : [props: MakeChildrenOptional<T>]
) => StcComponentCreator<T>

export type StcComponentCreator<T> = ComponentCreator<T> & {
  code(template: TemplateStringsArray, ...substitutions: (Children | Intrinsic)[]): ComponentCreator<T>
  children(...children: (Children | Intrinsic)[]): ComponentCreator<T>
}

/**
 * Main stc wrapper function that creates a string template component
 *
 * This matches the Alloy framework pattern with chainable methods for
 * code(), text(), and children().
 *
 * @example
 * ```ts
 * import { stc, code } from '@kubb/fabric-core'
 *
 * const Component = stc((props: { name: string }) => {
 *   return `Hello, ${props.name}!`
 * })
 *
 * // Use with props
 * const result1 = Component({ name: 'World' })()
 *
 * // Use with code template
 * const result2 = Component({ name: 'Alice' }).code`const greeting = "Hi!"`()
 *
 * // Use with children
 * const result3 = Component().children('child1', 'child2')()
 * ```
 */
export function stc<T extends {}>(Component: ComponentDefinition<T>): StcSignature<T> {
  return (...args) => {
    const fn: StcComponentCreator<T> = (() => Component(args[0] as T)) as any
    fn.component = Component
    fn.props = args[0]! as T
    fn.code = (template, ...substitutions): ComponentCreator<T> => {
      const propsWithChildren = {
        ...(args[0] ?? {}),
        children: code(template, ...substitutions),
      }

      const fn = () => Component(propsWithChildren as any)
      fn.component = Component
      fn.props = args[0]! as T
      return fn
    }
    fn.children = (...children: Children[]): ComponentCreator<T> => {
      const propsWithChildren = {
        ...(args[0] ?? {}),
        children,
      }

      const fn = () => Component(propsWithChildren as any)
      fn.component = Component
      fn.props = args[0]! as T
      return fn
    }

    return fn
  }
}

/**
 * Tagged template literal helper for inline code generation
 * Now supports intrinsic formatting elements for precise control over whitespace
 *
 * @example
 * ```ts
 * import { br, indent, dedent } from '@kubb/fabric-core'
 *
 * const result = code`function hello() {${indent}${br}console.log("hi")${dedent}${br}}`
 * // => "function hello() {\n  console.log("hi")\n}"
 * ```
 */
export function code(strings: TemplateStringsArray, ...values: (Children | Intrinsic)[]): string {
  const parts: (string | Intrinsic)[] = []

  for (let i = 0; i < strings.length; i++) {
    if (strings[i]) {
      parts.push(strings[i])
    }
    if (i < values.length) {
      const value = values[i]

      // Handle intrinsic elements
      if (isIntrinsic(value)) {
        parts.push(value)
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        for (const item of value) {
          if (isIntrinsic(item)) {
            parts.push(item)
          } else if (item !== null && item !== undefined) {
            parts.push(String(item))
          }
        }
      }
      // Handle regular values
      else if (value !== null && value !== undefined) {
        parts.push(String(value))
      }
    }
  }

  return renderIntrinsics(parts)
}
