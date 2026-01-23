import type { Parser, UserParser } from './types.ts'

/**
 * Defines a Fabric parser with type safety.
 *
 * Use this function to create parsers that transform files based on
 * their extension.
 *
 * @param parser - The parser configuration object
 * @returns A typed parser ready to use with Fabric
 *
 * @example
 * ```ts
 * import { defineParser } from '@kubb/fabric-core'
 *
 * export const jsonParser = defineParser({
 *   name: 'json-parser',
 *   extensions: ['.json'],
 *   async parse(source, meta) {
 *     const data = JSON.parse(source)
 *     return data
 *   }
 * })
 * ```
 */
export function defineParser<TOptions = unknown, TMeta extends object = any>(parser: UserParser<TOptions, TMeta>): Parser<TOptions, TMeta> {
  return {
    type: 'parser',
    ...parser,
  }
}
