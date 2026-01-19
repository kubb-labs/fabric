import type { FabricComponent, FabricElement, FabricNode } from './Fabric.ts'

type MakeChildrenOptional<T extends object> = T extends { children?: any } ? Omit<T, 'children'> & Partial<Pick<T, 'children'>> : T

export type ComponentBuilder<T extends object> = {
  (...args: unknown extends T ? [] : {} extends Omit<T, 'children'> ? [props?: MakeChildrenOptional<T>] : [props: MakeChildrenOptional<T>]): FabricElement<T>
  displayName?: string | undefined
}

export function createComponent<T extends object>(Component: FabricComponent<T>): ComponentBuilder<T> {
  return (...args) => {
    const fn: FabricElement<T> = (() => Component(args[0] as T)) as any
    fn.component = Component
    fn.props = args[0]! as T
    fn.children = (...children: Array<FabricNode>) => {
      const propsWithChildren = {
        ...(args[0] ?? {}),
        children() {
          // trick to make sure that children are rendered as function so the inject/provide could work, parents first and then child
          return children
            .map((child) => {
              if (typeof child === 'function') {
                return child()
              }
              return child
            })
            .join('')
        },
      } as unknown as T

      const fn = (() => Component(propsWithChildren)) as FabricElement<T>
      fn.component = Component
      fn.props = args[0]! as T
      return fn
    }

    return fn
  }
}
