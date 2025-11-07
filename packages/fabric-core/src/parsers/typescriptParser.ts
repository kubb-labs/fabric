import path from 'node:path'
import ts from 'typescript'
import { getRelativePath } from '../utils/getRelativePath.ts'
import { trimExtName } from '../utils/trimExtName.ts'
import { createParser } from './createParser.ts'

const { factory } = ts

/**
 * Convert AST TypeScript/TSX nodes to a string based on the TypeScript printer.
 */
export function print(...elements: Array<ts.Node>): string {
  const sourceFile = ts.createSourceFile('print.tsx', '', ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX)

  const printer = ts.createPrinter({
    omitTrailingSemicolon: true,
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    noEmitHelpers: true,
  })

  const output = printer.printList(ts.ListFormat.MultiLine, factory.createNodeArray(elements), sourceFile)

  return output.replace(/\r\n/g, '\n')
}

export function createImport({
  name,
  path,
  root,
  isTypeOnly = false,
  isNameSpace = false,
}: {
  name: string | Array<string | { propertyName: string; name?: string }>
  path: string
  root?: string
  isTypeOnly?: boolean
  isNameSpace?: boolean
}) {
  const resolvePath = root ? getRelativePath(root, path) : path

  if (!Array.isArray(name)) {
    let importPropertyName: ts.Identifier | undefined = factory.createIdentifier(name)
    let importName: ts.NamedImportBindings | undefined

    if (isNameSpace) {
      importPropertyName = undefined
      importName = factory.createNamespaceImport(factory.createIdentifier(name))
    }

    return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(isTypeOnly, importPropertyName, importName),
      factory.createStringLiteral(resolvePath),
      undefined,
    )
  }

  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      isTypeOnly,
      undefined,
      factory.createNamedImports(
        name.map((item) => {
          if (typeof item === 'object') {
            const obj = item as { propertyName: string; name?: string }
            if (obj.name) {
              return factory.createImportSpecifier(false, factory.createIdentifier(obj.propertyName), factory.createIdentifier(obj.name))
            }

            return factory.createImportSpecifier(false, undefined, factory.createIdentifier(obj.propertyName))
          }

          return factory.createImportSpecifier(false, undefined, factory.createIdentifier(item))
        }),
      ),
    ),
    factory.createStringLiteral(resolvePath),
    undefined,
  )
}

export function createExport({
  path,
  asAlias,
  isTypeOnly = false,
  name,
}: {
  path: string
  asAlias?: boolean
  isTypeOnly?: boolean
  name?: string | Array<ts.Identifier | string>
}) {
  if (name && !Array.isArray(name) && !asAlias) {
    console.warn(`When using name as string, asAlias should be true ${name}`)
  }

  if (!Array.isArray(name)) {
    const parsedName = name?.match(/^\d/) ? `_${name?.slice(1)}` : name

    return factory.createExportDeclaration(
      undefined,
      isTypeOnly,
      asAlias && parsedName ? factory.createNamespaceExport(factory.createIdentifier(parsedName)) : undefined,
      factory.createStringLiteral(path),
      undefined,
    )
  }

  return factory.createExportDeclaration(
    undefined,
    isTypeOnly,
    factory.createNamedExports(
      name.map((propertyName) => {
        return factory.createExportSpecifier(false, undefined, typeof propertyName === 'string' ? factory.createIdentifier(propertyName) : propertyName)
      }),
    ),
    factory.createStringLiteral(path),
    undefined,
  )
}

export const typescriptParser = createParser({
  name: 'typescript',
  extNames: ['.ts', '.js'],
  install() {},
  async parse(file, options = { extname: '.ts' }) {
    const sourceParts: Array<string> = []
    for (const item of file.sources) {
      if (item.value) {
        sourceParts.push(item.value)
      }
    }
    const source = sourceParts.join('\n\n')

    const importNodes: Array<ts.ImportDeclaration> = []
    for (const item of file.imports) {
      const importPath = item.root ? getRelativePath(item.root, item.path) : item.path
      const hasExtname = !!path.extname(importPath)

      importNodes.push(
        createImport({
          name: item.name,
          path: options.extname && hasExtname ? `${trimExtName(importPath)}${options.extname}` : item.root ? trimExtName(importPath) : importPath,
          isTypeOnly: item.isTypeOnly,
        }),
      )
    }

    const exportNodes: Array<ts.ExportDeclaration> = []
    for (const item of file.exports) {
      const exportPath = item.path
      const hasExtname = !!path.extname(exportPath)

      exportNodes.push(
        createExport({
          name: item.name,
          path: options.extname && hasExtname ? `${trimExtName(item.path)}${options.extname}` : trimExtName(item.path),
          isTypeOnly: item.isTypeOnly,
          asAlias: item.asAlias,
        }),
      )
    }

    const parts = [file.banner, print(...importNodes, ...exportNodes), source, file.footer].filter(
      (segment): segment is string => segment != null,
    )
    return parts.join('\n')
  },
})
