import { orderBy } from 'natural-orderby'

export type Param = {
  /**
   * `object` will return the pathParams as an object.
   *
   * `inline` will return the pathParams as comma separated params.
   * @default `'inline'`
   * @private
   */
  mode?: 'object' | 'inline' | 'inlineSpread'
  type?: 'string' | 'number' | (string & {})
  optional?: boolean
  /**
   * @example test = "default"
   */
  default?: string
  /**
   * Used for no TypeScript(with mode object)
   * @example test: "default"
   */
  value?: string
  children?: Params
}

type ParamItem =
  | (Pick<Param, 'mode' | 'type' | 'value'> & {
      optional?: true
      default?: never
      children?: Params
    })
  | (Pick<Param, 'mode' | 'type' | 'value'> & {
      optional?: false
      default?: string
      children?: Params
    })

const TSBasicTypes = ['number', 'string', 'null', 'undefined', 'bigint', 'boolean', 'symbol'] as const

type ParamEntry = [key: string, item?: ParamItem | undefined]

export type Params = Record<string, Param | undefined>

type Options = {
  type: 'constructor' | 'call' | 'object' | 'objectValue' | 'callback'
  transformName?: (name: string) => string
  transformType?: (type: string) => string
}

function order(items: Array<[key: string, item?: ParamItem]>) {
  return orderBy(
    items.filter(Boolean),
    [
      ([_key, item]) => {
        if (item?.children) {
          return undefined
        }
        return !item?.default
      },
      ([_key, item]) => {
        if (item?.children) {
          return undefined
        }
        return !item?.optional
      },
    ],
    ['desc', 'desc'],
  )
}

function processEntry(options: Options): ([key, item]: ParamEntry) => string | null {
  return function ([key, item]: ParamEntry): string | null {
    if (!item) return null

    if (!item.children) return parseItem(key, item, options)
    if (Object.keys(item.children).length === 0) return null

    if (item.mode === 'inlineSpread') {
      return getFunctionParams(item.children, options)
    }

    return parseChild(key, item, options)
  }
}

function processChildEntry(options: Options, entries: ParamEntry[]): ([key, item]: ParamEntry) => { name: string | null; type: string | null } | null {
  return function ([key, item]: ParamEntry): { name: string | null; type: string | null } | null {
    if (!item) return null

    const result = { name: null, type: null } as { name: string | null; type: string | null }

    const name = parseItem(key, { ...item, type: undefined }, options, item.type)

    if (!item.children) {
      result.name = options.type === 'call' && options.transformName ? `${key}: ${name}` : name
    } else {
      const subTypes = Object.keys(item.children).join(', ')
      result.name = subTypes ? `${name}: { ${subTypes} }` : name
    }

    const anySiblingHasType = entries.some(([_k, entries]) => !!entries?.type)
    if (anySiblingHasType) {
      result.type = parseItem(key, { ...item, default: undefined }, options, item.type)
    }

    return result
  }
}

function parseChild(key: string, item: ParamItem, options: Options): string | null {
  const entries = order(Object.entries(item.children as Record<string, ParamItem | undefined>))

  const optional = entries.every(([_key, item]) => item?.optional)

  const childEntryProcessor = processChildEntry(options, entries)
  const result = entries.map(childEntryProcessor).filter((item): item is { name: string | null; type: string | null } => item !== null)

  const names = result.map(({ name }) => name).filter(Boolean)
  const types = result.map(({ type }) => type).filter(Boolean)
  const name = item.mode === 'inline' ? key : names.length ? `{ ${names.join(', ')} }` : undefined
  const type = item.type ? item.type : types.length ? `{ ${types.join('; ')} }` : undefined

  if (!name) {
    return null
  }

  return parseItem(
    name,
    {
      type,
      default: item.default,
      optional: !item.default ? optional : undefined,
    } as ParamItem,
    options,
    item.type,
  )
}

function parseItem(name: string, item: ParamItem, options: Options, parentType?: string): string {
  const transformedName = options.transformName ? options.transformName(name) : name
  const transformedType = options.transformType && item.type ? options.transformType(item.type) : item.type

  if (options.type === 'object') {
    return transformedName
  }

  if (options.type === 'objectValue') {
    return item.value ? `${transformedName}: ${item.value}` : transformedName
  }
  if (options.type === 'callback') {
    const isObject = (transformedType?.includes('{') && transformedType?.includes('}')) ?? false

    if (transformedType === parentType) {
      if (transformedType && !TSBasicTypes.includes(transformedType as (typeof TSBasicTypes)[number])) {
        return `${transformedName}: { [K in keyof ${transformedType}]: () => ${transformedType}[K] }`
      }
    }
    if (item.default) {
      if (isObject) return transformedType ? `${transformedName}: ${transformedType} = ${item.default}` : `${transformedName} = ${item.default}`
      return transformedType ? `${transformedName}: () => ${transformedType} = () => ${item.default}` : `${transformedName} = () => ${item.default}`
    }
    if (item.optional) {
      if (isObject) return transformedType ? `${transformedName}?: ${transformedType}` : transformedName
      return transformedType ? `${transformedName}?: () => ${transformedType}` : transformedName
    }
    if (transformedType) {
      if (isObject) return `${transformedName}: ${transformedType}`
      return `${transformedName}: () => ${transformedType}`
    }
    return transformedName
  }

  if (options.type === 'constructor') {
    if (item.mode === 'inlineSpread') {
      return `... ${transformedName}`
    }
    if (item.value) {
      return `${transformedName} : ${item.value}`
    }
    if (item.default) {
      return transformedType ? `${transformedName}: ${transformedType} = ${item.default}` : `${transformedName} = ${item.default}`
    }
    if (item.optional) {
      return transformedType ? `${transformedName}?: ${transformedType}` : `${transformedName}`
    }
    if (transformedType) {
      return `${transformedName}: ${transformedType}`
    }

    return transformedName
  }

  return transformedName
}

export function getFunctionParams(params: Params, options: Options): string {
  const entries: ParamEntry[] = order(Object.entries(params as Record<string, ParamItem | undefined>))
  const entryProcessor = processEntry(options)

  return entries
    .map(entryProcessor)
    .filter((item): item is string => item !== null)
    .join(', ')
}

export function createFunctionParams(params: Params): Params {
  return params
}
// TODO  use of zod
//TODO use of string as `$name: $type` to create templates for functions instead of call/constructor
export class FunctionParams {
  #params: Params

  static factory(params: Params) {
    return new FunctionParams(params)
  }
  constructor(params: Params) {
    this.#params = params
  }

  get params(): Params {
    return this.#params
  }

  get flatParams(): Params {
    const flatter = (acc: Params, [key, item]: [key: string, item?: Param]): Params => {
      if (item?.children) {
        return Object.entries(item.children).reduce(flatter, acc)
      }
      if (item) {
        acc[key] = item
      }

      return acc
    }
    return Object.entries(this.#params).reduce(flatter, {} as Params)
  }

  toCall({ transformName, transformType }: Pick<Options, 'transformName' | 'transformType'> = {}): string {
    return getFunctionParams(this.#params, { type: 'call', transformName, transformType })
  }

  toObject(): string {
    return getFunctionParams(this.#params, { type: 'object' })
  }
  toObjectValue(): string {
    return getFunctionParams(this.#params, { type: 'objectValue' })
  }

  toConstructor(): string {
    return getFunctionParams(this.#params, { type: 'constructor' })
  }

  toCallback(): string {
    return getFunctionParams(this.#params, { type: 'callback' })
  }
}
