import type { Parser, UserParser } from './types.ts'

export function createParser<TOptions = any[], TMeta extends object = any>(parser: UserParser<TOptions, TMeta>): Parser<TOptions, TMeta> {
  return {
    type: 'parser',
    ...parser,
  }
}
