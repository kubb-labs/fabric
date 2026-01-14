import { type Intrinsic, isIntrinsic, renderIntrinsicsNormalized } from './intrinsic.ts'

/**
 * Convert a value into an array of parts (string | Intrinsic)
 */
function normalizeValue(value: any): Array<string | Intrinsic> {
  if (isIntrinsic(value)) {
    return [value]
  }

  if (value === null || value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    const out: Array<string | Intrinsic> = []

    for (const item of value) {
      if (isIntrinsic(item)) {
        out.push(item)
      }
      if (item !== null && item !== undefined) {
        out.push(String(item))
      }
    }
    return out
  }
  return [String(value)]
}

export function code(strings: TemplateStringsArray, ...values: Array<string | number | Array<any> | null | undefined | Intrinsic>): string {
  const parts: Array<string | Intrinsic> = []

  for (const [i, chunk] of strings.entries()) {
    if (chunk) {
      parts.push(chunk)
    }

    const normalizeValues = normalizeValue(values[i])

    if (normalizeValues.length) {
      parts.push(...normalizeValues)
    }
  }

  return renderIntrinsicsNormalized(parts)
}
