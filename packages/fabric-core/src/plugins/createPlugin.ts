import type { Plugin, UserPlugin } from './types.ts'

export function createPlugin<Options = any[]>(plugin: UserPlugin<Options>): Plugin<Options> {
  return {
    type: 'plugin',
    ...plugin,
  }
}
