import type { FabricComponent, FabricElement, FabricNode } from './Fabric.ts'
import { transform } from './transform.ts'

type MakeChildrenOptional<T extends object> = T extends { children?: any } ? Omit<T, 'children'> & Partial<Pick<T, 'children'>> : T

export type ComponentBuilder<T extends object> = {
  (...args: unknown extends T ? [] : {} extends Omit<T, 'children'> ? [props?: MakeChildrenOptional<T>] : [props: MakeChildrenOptional<T>]): FabricElement<T>
  displayName?: string | undefined
}

export function isFabricElement<TProps extends object = object>(value: any): value is FabricElement<TProps> {
  return typeof value === 'function' && 'type' in value && 'component' in value
}

export function createComponent<T extends object>(type: string, Component: FabricComponent<T>): ComponentBuilder<T> {
  return (...args) => {
    const fn: FabricElement<T> = (() => transform(Component(args[0] as T) as FabricNode)) as any
    fn.component = Component
    fn.props = args[0]! as T
    fn.type = type
    fn.children = (...children: Array<FabricNode>) => {
      const propsWithChildren = {
        ...(args[0] ?? {}),
        children() {
          return transform(children)
        },
      } as unknown as T

      const fnChild = (() => transform(Component(propsWithChildren) as FabricNode)) as FabricElement<T>
      fnChild.component = Component
      fnChild.props = args[0]! as T
      fn.type = type
      return fnChild
    }

    return fn
  }
}
