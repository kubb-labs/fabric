export function trimExtName(text: string): string {
  return text.replace(/\.[^/.]+$/, '')
}
