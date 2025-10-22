import type { Install } from '../defineApp.ts'

export type Plugin<TOptions = any[]> = {
  name: string
  type: 'plugin'
  install: Install<TOptions>
}

export type UserPlugin<TOptions = any[]> = Omit<Plugin<TOptions>, 'type'>
