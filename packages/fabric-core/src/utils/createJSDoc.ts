/**
 * Create JSDoc comment block from comments array
 */
export function createJSDoc({ comments }: { comments: string[] }): string {
  if (!comments || comments.length === 0) return ''

  const lines = comments
    .flatMap((c) => String(c ?? '').split(/\r?\n/))
    .map((l) => l.replace(/\*\//g, '*\\/').replace(/\r/g, ''))
    .filter((l) => l.trim().length > 0)

  if (lines.length === 0) return ''

  return ['/**', ...lines.map((l) => ` * ${l}`), ' */'].join('\n')
}
