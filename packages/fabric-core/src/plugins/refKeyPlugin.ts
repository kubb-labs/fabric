import type { FabricContext } from '../Fabric.ts'
import { RefKeyRegistry, resolveImportsFromRefKeys } from '../utils/importResolver.ts'
import { definePlugin } from './definePlugin.ts'

export type Options = {
  /**
   * Enable automatic import resolution based on refkeys
   * @default true
   */
  enabled?: boolean
}

/**
 * Plugin for automatic import management using RefKeys.
 * Inspired by Alloy's refkey system.
 * 
 * When enabled, this plugin:
 * 1. Tracks all refkey definitions across files
 * 2. Automatically resolves and adds imports when refkeys are used
 * 
 * @example
 * ```ts
 * const fabric = createFabric()
 * fabric.use(refKeyPlugin)
 * 
 * const fooRef = createRefKey()
 * 
 * // Define symbol with refkey
 * fabric.addFile({
 *   path: 'file1.ts',
 *   sources: [{
 *     name: 'foo',
 *     value: 'const foo = "bar"',
 *     refkey: fooRef.resolve('foo', './file1.ts')
 *   }]
 * })
 * 
 * // Use refkey in another file - import will be auto-added
 * fabric.addFile({
 *   path: 'file2.ts',
 *   sources: [{ value: fooRef }]
 * })
 * ```
 */
export const refKeyPlugin = definePlugin<Options>({
  name: 'refKeyPlugin',
  install(ctx: FabricContext, options = {}) {
    const { enabled = true } = options

    if (!enabled) {
      return
    }

    const registry = new RefKeyRegistry()

    // Track refkey definitions when files are added
    ctx.on('files:added', async (files) => {
      for (const file of files) {
        for (const source of file.sources) {
          if (source.refkey) {
            registry.registerFromSource(source, file.path)
          }
        }
      }
    })

    // Auto-resolve imports before processing
    ctx.on('files:processing:start', async (files) => {
      for (const file of files) {
        // Generate imports based on refkey usage
        const autoImports = resolveImportsFromRefKeys(file, registry, file.path)
        
        // Merge with existing imports
        if (autoImports.length > 0) {
          file.imports = [...(file.imports || []), ...autoImports]
        }
      }
    })

    // Clear registry when lifecycle ends
    ctx.on('lifecycle:end', async () => {
      registry.clear()
    })
  },
})
