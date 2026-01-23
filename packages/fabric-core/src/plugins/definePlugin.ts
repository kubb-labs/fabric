import type { Plugin, UserPlugin } from './types.ts'

/**
 * Defines a Fabric plugin with type safety.
 *
 * Use this function to create plugins that hook into Fabric's lifecycle
 * events and extend its functionality.
 *
 * @param plugin - The plugin configuration object
 * @returns A typed plugin ready to use with Fabric
 *
 * @example
 * ```ts
 * import { definePlugin } from '@kubb/fabric-core'
 *
 * export const myPlugin = definePlugin({
 *   name: 'my-plugin',
 *   async setup(fabric) {
 *     fabric.context.on('write:start', (files) => {
 *       console.log(`Writing ${files.length} files`)
 *     })
 *   }
 * })
 * ```
 */
export function definePlugin<Options = unknown, TAppExtension extends Record<string, any> = {}>(
  plugin: UserPlugin<Options, TAppExtension>,
): Plugin<Options, TAppExtension> {
  return {
    type: 'plugin',
    ...plugin,
  }
}
