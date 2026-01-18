import type { FabricComponent, FabricElement, FabricNode } from './Fabric.ts'

type MakeChildrenOptional<T extends object> = T extends { children?: any } ? Omit<T, 'children'> & Partial<Pick<T, 'children'>> : T

type ElementCreator<T extends {}> = (
  ...args: unknown extends T ? [] : {} extends Omit<T, 'children'> ? [props?: MakeChildrenOptional<T>] : [props: MakeChildrenOptional<T>]
) => FabricElement<T>

export function fsx<T extends {}>(Component: FabricComponent<T>): ElementCreator<T> {
  return (...args) => {
    const fn: FabricElement<T> = (() => Component(args[0] as T)) as any
    fn.component = Component
    fn.props = args[0]! as T
    fn.children = (...children: Array<FabricNode>) => {
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
