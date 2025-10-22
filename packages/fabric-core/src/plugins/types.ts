import type { Install, Override } from '../App.ts'

export type Plugin<TOptions = any[], TAppExtension extends Record<string, any> = {}> = {
  name: string
  type: 'plugin'
  scope?: 'write' | 'read' | (string & {})
  install: Install<TOptions> | Promise<Install<TOptions>>
  /**
   * Runtime app overrides or extensions.
   * Merged into the app instance after install.
   */
  override?: Override<TOptions, TAppExtension>
}

export type UserPlugin<TOptions = any[], TAppExtension extends Record<string, any> = {}> = Omit<Plugin<TOptions, TAppExtension>, 'type'>
