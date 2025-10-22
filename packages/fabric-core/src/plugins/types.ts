import type { Install } from '../defineApp.ts'

export type Plugin<TOptions = any[]> = {
  name: string
  type: 'plugin'
  scope?: 'write' | 'read' | (string & {})
  install: Install<TOptions> | Promise<Install<TOptions>>
}

export type UserPlugin<TOptions = any[]> = Omit<Plugin<TOptions>, 'type'>
