import type * as KubbFile from '../KubbFile.ts'
import type { Install } from '../App.ts'

type PrintOptions = {
  extname?: KubbFile.Extname
}

export type Parser<TOptions = unknown, TMeta extends object = any> = {
  name: string
  type: 'parser'
  /**
   * Undefined is being used for the defaultParser
   */
  extNames: Array<KubbFile.Extname> | undefined
  install: Install<TOptions>
  /**
   * Convert a file to string
   */
  parse(file: KubbFile.ResolvedFile<TMeta>, options: PrintOptions): Promise<string>
}

export type UserParser<TOptions = unknown, TMeta extends object = any> = Omit<Parser<TOptions, TMeta>, 'type'>
