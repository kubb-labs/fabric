import path from 'node:path'
import ts from 'typescript'
import type { JSDoc } from '../types.ts'
import { getRelativePath } from '../utils/getRelativePath.ts'
import { trimExtName } from '../utils/trimExtName.ts'
import { defineParser } from './defineParser.ts'

const { factory } = ts

// ---------------------------------------------------------------------------
// Internal parse helpers – convert string representations into TypeScript AST
// nodes using the TypeScript compiler's own parser for correctness.
// ---------------------------------------------------------------------------

/**
 * Parse a TypeScript type string (e.g. `"string"`, `"User"`, `"Promise<T>"`)
 * into a `ts.TypeNode`.
 */
function parseTypeNode(typeStr: string): ts.TypeNode {
  const source = ts.createSourceFile('temp.ts', `type __T = ${typeStr}`, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
  const typeAlias = source.statements[0] as ts.TypeAliasDeclaration
  return typeAlias.type
}

/**
 * Parse a TypeScript parameter list string (e.g. `"id: number, name: string"`)
 * into an array of `ts.ParameterDeclaration` nodes.
 */
function parseParameters(paramsStr: string): ts.ParameterDeclaration[] {
  if (!paramsStr.trim()) {
    return []
  }
  const source = ts.createSourceFile('temp.ts', `function __f(${paramsStr}) {}`, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
  const fn = source.statements[0] as ts.FunctionDeclaration
  return [...(fn.parameters ?? [])]
}

/**
 * Parse a TypeScript generic type-parameter string (e.g. `"T extends string"`)
 * into an array of `ts.TypeParameterDeclaration` nodes.
 */
function parseTypeParameters(genericsStr: string): ts.TypeParameterDeclaration[] {
  if (!genericsStr.trim()) {
    return []
  }
  const source = ts.createSourceFile('temp.ts', `function __f<${genericsStr}>() {}`, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
  const fn = source.statements[0] as ts.FunctionDeclaration
  return [...(fn.typeParameters ?? [])]
}

/**
 * Parse a TypeScript statement list string (e.g. `"return id"`)
 * into an array of `ts.Statement` nodes suitable for a function body.
 */
function parseStatements(bodyStr: string): ts.Statement[] {
  if (!bodyStr.trim()) {
    return []
  }
  const source = ts.createSourceFile('temp.ts', `function __f() { ${bodyStr} }`, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
  const fn = source.statements[0] as ts.FunctionDeclaration
  return [...(fn.body?.statements ?? [])]
}

/**
 * Parse a TypeScript expression string (e.g. `"{ a: 1 }"`, `"'hello'"`)
 * into a `ts.Expression` node.
 */
function parseExpression(exprStr: string): ts.Expression {
  const source = ts.createSourceFile('temp.ts', `const __v = ${exprStr}`, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
  const stmt = source.statements[0] as ts.VariableStatement
  const initializer = stmt.declarationList.declarations[0]?.initializer
  if (!initializer) {
    throw new Error(`Could not parse expression: ${exprStr}`)
  }
  return initializer
}

/**
 * Attach a JSDoc block comment as synthetic leading trivia to a node.
 */
function addJSDocComment<T extends ts.Node>(node: T, jsdoc: JSDoc): T {
  if (!jsdoc.comments.length) {
    return node
  }
  const commentBody = `*\n${jsdoc.comments.map((c) => ` * ${c}`).join('\n')}\n `
  return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, commentBody, true) as T
}

// ---------------------------------------------------------------------------
// Public types for AST factory function props – intentionally mirror the
// props accepted by the JSX components (Function, Type, Const, …) so that
// the same data can drive either the text-based renderer or the AST builder.
// ---------------------------------------------------------------------------

export type FunctionNodeProps = {
  /** Function name. */
  name: string
  /** Whether the function is async. Wraps `returnType` in `Promise<…>`. */
  async?: boolean
  /** Emit the `export` keyword. */
  export?: boolean
  /** Emit the `default` keyword (use with `export`). */
  default?: boolean
  /** Generic type parameters, e.g. `"T extends string"` or `["T", "U"]`. */
  generics?: string | string[]
  /** Parameter list string, e.g. `"id: number, name: string"`. */
  params?: string
  /** Return type string, e.g. `"User"`. */
  returnType?: string
  /** Function body source code string. */
  body?: string
  /** JSDoc comment block. */
  JSDoc?: JSDoc
}

export type ArrowFunctionNodeProps = {
  /** Variable name that holds the arrow function. */
  name: string
  /** Whether the arrow function is async. Wraps `returnType` in `Promise<…>`. */
  async?: boolean
  /** Emit the `export` keyword on the variable statement. */
  export?: boolean
  /** Generic type parameters, e.g. `"T extends string"` or `["T", "U"]`. */
  generics?: string | string[]
  /** Parameter list string, e.g. `"id: number, name: string"`. */
  params?: string
  /** Return type string, e.g. `"User"`. */
  returnType?: string
  /** Arrow function body source code string. */
  body?: string
  /**
   * When `true` the body is treated as a concise expression body rather than
   * a block body, producing `const name = (…) => expr`.
   */
  singleLine?: boolean
  /** JSDoc comment block. */
  JSDoc?: JSDoc
}

export type TypeAliasNodeProps = {
  /** Type alias name (must start with an uppercase letter). */
  name: string
  /** Emit the `export` keyword. */
  export?: boolean
  /** Generic type parameters, e.g. `"T extends string"` or `["T", "U"]`. */
  generics?: string | string[]
  /** The type expression string, e.g. `"string | number"`. */
  type: string
  /** JSDoc comment block. */
  JSDoc?: JSDoc
}

export type ConstNodeProps = {
  /** Variable name. */
  name: string
  /** Emit the `export` keyword. */
  export?: boolean
  /** Optional type annotation string, e.g. `"string[]"`. */
  type?: string
  /** Append `as const` to the initialiser. */
  asConst?: boolean
  /** Initialiser expression string, e.g. `"'hello'"` or `"{ a: 1 }"`. */
  value: string
  /** JSDoc comment block. */
  JSDoc?: JSDoc
}

// ---------------------------------------------------------------------------
// Public AST factory functions
// ---------------------------------------------------------------------------

/**
 * Create a TypeScript **function declaration** AST node from props that mirror
 * the `<Function>` JSX component.
 *
 * The resulting `ts.FunctionDeclaration` can be printed to a string via
 * {@link print}.
 *
 * @example
 * ```ts
 * import { createFunction, print } from '@kubb/fabric-core/parsers/typescript'
 *
 * const node = createFunction({
 *   name: 'getUser',
 *   export: true,
 *   async: true,
 *   params: 'id: number',
 *   returnType: 'User',
 *   body: 'return fetch(`/users/${id}`).then(r => r.json())',
 * })
 *
 * console.log(print(node))
 * ```
 */
export function createFunction({
  name,
  async: isAsync = false,
  export: canExport = false,
  default: isDefault = false,
  generics,
  params,
  returnType,
  body,
  JSDoc,
}: FunctionNodeProps): ts.FunctionDeclaration {
  const modifiers: ts.Modifier[] = []
  if (canExport) modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))
  if (isDefault) modifiers.push(factory.createModifier(ts.SyntaxKind.DefaultKeyword))
  if (isAsync) modifiers.push(factory.createModifier(ts.SyntaxKind.AsyncKeyword))

  const typeParameters = generics ? parseTypeParameters(Array.isArray(generics) ? generics.join(', ') : generics) : undefined

  const parameters = params ? parseParameters(params) : []

  const returnTypeNode = returnType ? parseTypeNode(isAsync ? `Promise<${returnType}>` : returnType) : undefined

  const bodyBlock = factory.createBlock(body ? parseStatements(body) : [], true)

  const node = factory.createFunctionDeclaration(
    modifiers.length ? modifiers : undefined,
    undefined,
    factory.createIdentifier(name),
    typeParameters,
    parameters,
    returnTypeNode,
    bodyBlock,
  )

  return JSDoc ? addJSDocComment(node, JSDoc) : node
}

/**
 * Create a TypeScript **arrow function variable statement** AST node from
 * props that mirror the `<Function.Arrow>` JSX component.
 *
 * The resulting `ts.VariableStatement` (`const name = … => …`) can be
 * printed to a string via {@link print}.
 *
 * @example
 * ```ts
 * const node = createArrowFunction({
 *   name: 'getUser',
 *   export: true,
 *   params: 'id: number',
 *   returnType: 'string',
 *   singleLine: true,
 *   body: 'String(id)',
 * })
 * ```
 */
export function createArrowFunction({
  name,
  async: isAsync = false,
  export: canExport = false,
  generics,
  params,
  returnType,
  body,
  singleLine = false,
  JSDoc,
}: ArrowFunctionNodeProps): ts.VariableStatement {
  const arrowModifiers: ts.Modifier[] = []
  if (isAsync) arrowModifiers.push(factory.createModifier(ts.SyntaxKind.AsyncKeyword))

  const typeParameters = generics ? parseTypeParameters(Array.isArray(generics) ? generics.join(', ') : generics) : undefined

  const parameters = params ? parseParameters(params) : []

  const returnTypeNode = returnType ? parseTypeNode(isAsync ? `Promise<${returnType}>` : returnType) : undefined

  const arrowBody: ts.ConciseBody =
    singleLine && body ? parseExpression(body) : factory.createBlock(body ? parseStatements(body) : [], true)

  const arrowFn = factory.createArrowFunction(
    arrowModifiers.length ? arrowModifiers : undefined,
    typeParameters,
    parameters,
    returnTypeNode,
    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    arrowBody,
  )

  const stmtModifiers: ts.Modifier[] = []
  if (canExport) stmtModifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))

  const node = factory.createVariableStatement(
    stmtModifiers.length ? stmtModifiers : undefined,
    factory.createVariableDeclarationList([factory.createVariableDeclaration(factory.createIdentifier(name), undefined, undefined, arrowFn)], ts.NodeFlags.Const),
  )

  return JSDoc ? addJSDocComment(node, JSDoc) : node
}

/**
 * Create a TypeScript **type alias declaration** AST node from props that
 * mirror the `<Type>` JSX component.
 *
 * @example
 * ```ts
 * const node = createTypeAlias({
 *   name: 'UserId',
 *   export: true,
 *   type: 'string | number',
 * })
 * ```
 */
export function createTypeAlias({ name, export: canExport = false, generics, type, JSDoc }: TypeAliasNodeProps): ts.TypeAliasDeclaration {
  const modifiers: ts.Modifier[] = []
  if (canExport) modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))

  const typeParameters = generics ? parseTypeParameters(Array.isArray(generics) ? generics.join(', ') : generics) : undefined

  const node = factory.createTypeAliasDeclaration(modifiers.length ? modifiers : undefined, factory.createIdentifier(name), typeParameters, parseTypeNode(type))

  return JSDoc ? addJSDocComment(node, JSDoc) : node
}

/**
 * Create a TypeScript **const variable statement** AST node from props that
 * mirror the `<Const>` JSX component.
 *
 * @example
 * ```ts
 * const node = createConst({
 *   name: 'BASE_URL',
 *   export: true,
 *   value: '"https://api.example.com"',
 *   asConst: true,
 * })
 * ```
 */
export function createConst({ name, export: canExport = false, type, asConst = false, value, JSDoc }: ConstNodeProps): ts.VariableStatement {
  const modifiers: ts.Modifier[] = []
  if (canExport) modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))

  const typeNode = type ? parseTypeNode(type) : undefined
  const valueExpr = parseExpression(asConst ? `(${value}) as const` : value)

  const node = factory.createVariableStatement(
    modifiers.length ? modifiers : undefined,
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(factory.createIdentifier(name), undefined, typeNode, valueExpr)],
      ts.NodeFlags.Const,
    ),
  )

  return JSDoc ? addJSDocComment(node, JSDoc) : node
}

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

export const typescriptParser = defineParser({
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
