import type { Inject, Install } from '../Fabric.ts'

export type Plugin<TOptions = unknown, TAppExtension extends Record<string, any> = {}> = {
  name: string
  type: 'plugin'
  install: Install<TOptions>
  /**
   * Runtime app overrides or extensions.
   * Merged into the app instance after install.
   * This cannot be async
   */
  inject?: Inject<TOptions, TAppExtension>
}

export type UserPlugin<TOptions = unknown, TAppExtension extends Record<string, any> = {}> = Omit<Plugin<TOptions, TAppExtension>, 'type'>
