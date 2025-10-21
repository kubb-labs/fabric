import type * as KubbFile from '../KubbFile.ts'

type PrintOptions = {
  extname?: KubbFile.Extname
}

export type Parser<TMeta extends object = object> = {
  /**
   * Convert a file to string
   */
  print: (file: KubbFile.ResolvedFile<TMeta>, options: PrintOptions) => Promise<string>
}
