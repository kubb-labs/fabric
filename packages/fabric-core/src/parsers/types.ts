import type * as KubbFile from '../KubbFile.ts'
import type { Install } from '../defineApp.ts'

type PrintOptions = {
  extname?: KubbFile.Extname
}

export type Parser<TOptions = any[], TMeta extends object = any> = {
  name: string
  type: 'parser'
  install: Install<TOptions>
  /**
   * Convert a file to string
   */
  print: (file: KubbFile.ResolvedFile<TMeta>, options: PrintOptions) => Promise<string>
}

export type UserParser<TOptions = any[], TMeta extends object = any> = Omit<Parser<TOptions, TMeta>, 'type'>
