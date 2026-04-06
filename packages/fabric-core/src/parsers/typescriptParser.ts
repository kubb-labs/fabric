import path from 'node:path'
import ts from 'typescript'
import type * as KubbFile from '../FabricFile.ts'
import { getRelativePath } from '../utils/getRelativePath.ts'
import { trimExtName } from '../utils/trimExtName.ts'
import { defineParser } from './defineParser.ts'

const { factory } = ts

/**
 * Validates TypeScript AST nodes before printing to catch invalid nodes early.
 * Throws an error if any node has SyntaxKind.Unknown which would cause the TypeScript printer to crash.
 */
export function validateNodes(...nodes: ts.Node[]): void {
  for (const node of nodes) {
    if (!node) {
      throw new Error('Attempted to print undefined or null TypeScript node')
    }
    if (node.kind === ts.SyntaxKind.Unknown) {
      throw new Error(
        'Invalid TypeScript AST node detected with SyntaxKind.Unknown. ' +
          `This typically indicates a schema pattern that couldn't be properly converted to TypeScript. ` +
          `Node: ${JSON.stringify(node, null, 2)}`,
      )
    }
  }
}

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

  for (const node of elements) {
    if (node.kind === ts.SyntaxKind.Unknown) {
      console.error('⚠️ Unknown node found:', node)
    }
  }

  const output = printer.printList(ts.ListFormat.MultiLine, factory.createNodeArray(elements.filter(Boolean)), sourceFile)

  return output.replace(/\r\n/g, '\n')
}

export function safePrint(...elements: Array<ts.Node>): string {
  validateNodes(...elements)

  return print(...elements)
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

  // Namespace or default import
  if (!Array.isArray(name)) {
    if (isNameSpace) {
      return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(isTypeOnly, undefined, factory.createNamespaceImport(factory.createIdentifier(name))),
        factory.createStringLiteral(resolvePath),
        undefined,
      )
    }

    return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(isTypeOnly, factory.createIdentifier(name), undefined),
      factory.createStringLiteral(resolvePath),
      undefined,
    )
  }

  // Named imports
  const specifiers = name.map((item) => {
    if (typeof item === 'object') {
      const { propertyName, name: alias } = item
      return factory.createImportSpecifier(false, alias ? factory.createIdentifier(propertyName) : undefined, factory.createIdentifier(alias ?? propertyName))
    }

    return factory.createImportSpecifier(false, undefined, factory.createIdentifier(item))
  })

  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(isTypeOnly, undefined, factory.createNamedImports(specifiers)),
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

/**
 * Parse a TypeScript code snippet to extract a specific statement.
 * Used internally to convert string-based props (params, generics, types) to AST nodes.
 */
function parseStatement<T extends ts.Statement>(code: string): T {
  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.ES2022, true)
  return sourceFile.statements[0] as T
}

/**
 * Parse function parameter declarations from a params string.
 * @example parseParams('id: number, name: string') → ParameterDeclaration[]
 */
function parseParams(params?: string): ts.ParameterDeclaration[] {
  if (!params) {
    return []
  }
  const func = parseStatement<ts.FunctionDeclaration>(`function f(${params}) {}`)
  return [...func.parameters]
}

/**
 * Parse type parameter declarations from a generics string or array.
 * @example parseTypeParameters('T') or parseTypeParameters(['T', 'U extends string'])
 */
function parseTypeParameters(generics?: string | string[]): ts.TypeParameterDeclaration[] | undefined {
  if (!generics) {
    return undefined
  }
  const gs = Array.isArray(generics) ? generics.join(', ').trim() : generics
  if (!gs) {
    return undefined
  }
  const func = parseStatement<ts.FunctionDeclaration>(`function f<${gs}>() {}`)
  return func.typeParameters ? [...func.typeParameters] : undefined
}

/**
 * Parse a TypeScript type annotation string to a TypeNode.
 * @example parseTypeAnnotation('User') → TypeReferenceNode
 */
function parseTypeAnnotation(typeStr?: string): ts.TypeNode | undefined {
  if (!typeStr) {
    return undefined
  }
  const typeAlias = parseStatement<ts.TypeAliasDeclaration>(`type T = ${typeStr}`)
  return typeAlias.type
}

/**
 * Create a TypeScript function declaration AST node from FunctionNode props.
 * Similar to createImport/createExport but for function declarations.
 *
 * @example
 * ```ts
 * const node = createFunction({ name: 'getUser', export: true, returnType: 'User' })
 * print(node) // → "export function getUser(): User {}"
 * ```
 */
export function createFunction({ name, params, export: isExport = false, default: isDefault = false, async: isAsync = false, generics, returnType }: KubbFile.FunctionNode): ts.FunctionDeclaration {
  const modifiers: ts.ModifierLike[] = []
  if (isExport) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))
  }
  if (isDefault) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.DefaultKeyword))
  }
  if (isAsync) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.AsyncKeyword))
  }

  const typeParameters = parseTypeParameters(generics)
  const parameters = parseParams(params)

  let returnTypeNode: ts.TypeNode | undefined
  if (returnType && isAsync) {
    const inner = parseTypeAnnotation(returnType) ?? factory.createTypeReferenceNode(returnType)
    returnTypeNode = factory.createTypeReferenceNode('Promise', [inner])
  } else {
    returnTypeNode = parseTypeAnnotation(returnType)
  }

  return factory.createFunctionDeclaration(
    modifiers.length ? modifiers : undefined,
    undefined,
    factory.createIdentifier(name),
    typeParameters,
    parameters,
    returnTypeNode,
    factory.createBlock([], true),
  )
}

/**
 * Create a TypeScript variable statement (const) AST node from ConstNode props.
 * Similar to createImport/createExport but for const declarations.
 *
 * @example
 * ```ts
 * const node = createConst({ name: 'API_URL', type: 'string', export: true })
 * print(node) // → "export const API_URL: string"
 * ```
 */
export function createConst({ name, type, export: isExport = false }: KubbFile.ConstNode): ts.VariableStatement {
  const modifiers: ts.ModifierLike[] = []
  if (isExport) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))
  }

  const typeNode = parseTypeAnnotation(type)

  return factory.createVariableStatement(
    modifiers.length ? modifiers : undefined,
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(factory.createIdentifier(name), undefined, typeNode, undefined)],
      ts.NodeFlags.Const,
    ),
  )
}

/**
 * Create a TypeScript type alias declaration AST node from TypeNode props.
 * Similar to createImport/createExport but for type alias declarations.
 *
 * @example
 * ```ts
 * const node = createTypeAlias({ name: 'User', export: true })
 * print(node) // → "export type User = unknown"
 * ```
 */
export function createTypeAlias({ name, export: isExport = false }: KubbFile.TypeNode): ts.TypeAliasDeclaration {
  const modifiers: ts.ModifierLike[] = []
  if (isExport) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))
  }

  return factory.createTypeAliasDeclaration(modifiers.length ? modifiers : undefined, factory.createIdentifier(name), undefined, factory.createTypeReferenceNode('unknown'))
}

export const typescriptParser = defineParser({
  name: 'typescript',
  extNames: ['.ts', '.js'],
  install() {},
  async parse(file, options = { extname: '.ts' }) {
    const sourceParts: Array<string> = []
    for (const item of file.sources) {
      if (item.value) {
        sourceParts.push(item.value)
      } else if (item.nodes && item.nodes.length > 0) {
        sourceParts.push(print(...item.nodes))
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
          isNameSpace: item.isNameSpace,
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

    const parts = [file.banner, print(...importNodes, ...exportNodes), source, file.footer].filter((segment): segment is string => segment != null)
    return parts.join('\n')
  },
})
