import { createUnplugin } from 'unplugin'

export default createUnplugin(() => {
  return {
    name: 'unplugin-craft',
    enforce: 'pre', // run before TS plugin
    transform(code, id) {
      if (!id.endsWith('.craft')) return

      // Regex to capture multiple `export file <name>() { return <object> }`
      const regex = /export\s+file\s+([A-Za-z0-9_]+)\s*\(\)\s*{\s*return\s*([\s\S]*?)\s*}\s*(?=export|$)/g

      const matches = Array.from(code.matchAll(regex))
      if (!matches.length) return

      const fileVars: string[] = []
      let out = `import { createFile } from '@kubb/craft-core'\n\n`

      for (const match of matches) {
        const [, name, body] = match
        out += `const ${name} = createFile(${body})\n`
        fileVars.push(name!)
      }

      out += `\nexport default { files: [${fileVars.join(', ')}] } \n`

      console.log(out)

      return { code: out, map: null }
    },
  }
})
