export function createJSDoc({ comments }: { comments: Array<string> }): string {
  if (!comments.length) {
    return ''
  }

  return `/**\n * ${comments.join('\n * ')}\n */`
}
