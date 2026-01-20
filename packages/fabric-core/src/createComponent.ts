import type { FabricComponent, FabricElement, FabricNode } from './Fabric.ts'
import { renderIntrinsic } from './intrinsic.ts'

type MakeChildrenOptional<T extends object> = T extends { children?: any } ? Omit<T, 'children'> & Partial<Pick<T, 'children'>> : T

export type ComponentBuilder<T extends object> = {
  (...args: unknown extends T ? [] : {} extends Omit<T, 'children'> ? [props?: MakeChildrenOptional<T>] : [props: MakeChildrenOptional<T>]): FabricComponent<T>
  displayName?: string | undefined
}

export function createComponent<TProps extends object>(type: string, Component: (props: TProps) => FabricNode): ComponentBuilder<TProps> {
  return (...args) => {
    const fn: FabricComponent<TProps> = (() => renderIntrinsic(Component(args[0] as TProps) as FabricNode)) as any
    fn.component = Component
    fn.props = args[0]! as TProps
    fn.type = type
    fn.children = (...children: Array<FabricNode>) => {
      const propsWithChildren = {
        ...(args[0] ?? {}),
        children() {
          return renderIntrinsic(children)
        },
      } as unknown as TProps

      const fnChild = (() => renderIntrinsic(Component(propsWithChildren) as FabricNode)) as FabricElement<TProps>
      fnChild.component = Component
      fnChild.props = args[0]! as TProps
      fnChild.type = type
      return fnChild
    }

    return fn
  }
}
