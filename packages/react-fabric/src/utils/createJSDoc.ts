export function createJSDoc({ comments }: { comments: Array<string> }): string {
  const filtered = comments.filter((c) => c.trim())
  if (!filtered.length) {
    return ''
  }

  return `/**\n * ${filtered.join('\n * ')}\n */`
}
