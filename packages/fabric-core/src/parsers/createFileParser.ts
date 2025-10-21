import type { Parser } from './types.ts'

export function createFileParser<TMeta extends object = object>(parser: Parser<TMeta>): Parser<TMeta> {
  return parser
}
