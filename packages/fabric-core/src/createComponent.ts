import type { FabricComponent, FabricElement, FabricNode } from './Fabric.ts'

type MakeChildrenOptional<T extends object> = T extends { children?: any } ? Omit<T, 'children'> & Partial<Pick<T, 'children'>> : T

export type ComponentBuilder<T extends object> = {
  (...args: unknown extends T ? [] : {} extends Omit<T, 'children'> ? [props?: MakeChildrenOptional<T>] : [props: MakeChildrenOptional<T>]): FabricElement<T>
  displayName?: string | undefined
}

export function transform(children: FabricNode): string {
  if (!children) {
    return ''
  }

  if (typeof children === 'function') {
    return transform(children())
  }

  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'number') {
    return `${children}`
  }

  if (typeof children === 'boolean') {
    return `${children}`
  }

  if (Array.isArray(children)) {
    return children.map(transform).join('')
  }

  return children
}

export function createComponent<T extends object>(Component: FabricComponent<T>): ComponentBuilder<T> {
  return (...args) => {
    const fn: FabricElement<T> = (() => transform(Component(args[0] as T) as FabricNode)) as any
    fn.component = Component
    fn.props = args[0]! as T
    fn.children = (...children: Array<FabricNode>) => {
      const propsWithChildren = {
        ...(args[0] ?? {}),
        children() {
          return transform(children)
        },
      } as unknown as T

      const fn = (() => transform(Component(propsWithChildren) as FabricNode)) as FabricElement<T>
      fn.component = Component
      fn.props = args[0]! as T
      return fn
    }

    return fn
  }
}
