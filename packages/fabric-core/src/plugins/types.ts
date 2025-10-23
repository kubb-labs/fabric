import type { Install, Inject } from '../App.ts'

export type Plugin<TOptions = any[], TAppExtension extends Record<string, any> = {}> = {
  name: string
  type: 'plugin'
  install: Install<TOptions> | Promise<Install<TOptions>>
  /**
   * Runtime app overrides or extensions.
   * Merged into the app instance after install.
   * This cannot be async
   */
  inject?: Inject<TOptions, TAppExtension>
}

export type UserPlugin<TOptions = any[], TAppExtension extends Record<string, any> = {}> = Omit<Plugin<TOptions, TAppExtension>, 'type'>
