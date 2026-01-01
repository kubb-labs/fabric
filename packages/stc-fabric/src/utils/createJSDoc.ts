/**
 * Create JSDoc comment block from comments array
 */
export function createJSDoc({ comments }: { comments: string[] }): string {
  if (!comments || comments.length === 0) {
    return ''
  }

  if (comments.length === 1) {
    return `/** ${comments[0]} */`
  }

  let result = '/**\n'
  for (const comment of comments) {
    result += ` * ${comment}\n`
  }
  result += ' */'
  
  return result
}
