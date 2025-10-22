import type { Plugin, UserPlugin } from './types.ts'

export function createPlugin<Options = any[], TAppExtension extends Record<string, any> = {}>(
  plugin: UserPlugin<Options, TAppExtension>,
): Plugin<Options, TAppExtension> {
  return {
    type: 'plugin',
    ...plugin,
  }
}
