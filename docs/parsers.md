---
layout: doc
title: Parsers - Transform Generated Code to Formats
description: Fabric parsers transform generated code into TypeScript, TSX, or plain text. Handle imports, exports, and formatting automatically.
outline: deep
---

# Parsers - Code Formatting & Transformation

Fabric parsers transform generated code into the correct format, handling imports, exports, formatting, and language-specific syntax.

**Use parsers to:**
- Format TypeScript/TSX code
- Organize imports and exports
- Handle file extension mapping
- Transform file objects to strings

**Perfect for:** TypeScript generation, React component generation, multi-language code generation.

## Available Parsers

### [TypeScript Parser](/parsers/typescript-parser)

Parse and format TypeScript (`.ts`) files with import/export handling.

**Use for:** TypeScript type definitions, constants, functions, interfaces.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()
fabric.use(typescriptParser)
```

### [TSX Parser](/parsers/tsx-parser)

Parse and format TSX (`.tsx`) files with JSX syntax support.

**Use for:** React components, JSX templates, TypeScript + JSX files.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()
fabric.use(tsxParser)
```

### [Default Parser](/parsers/default-parser)

Basic parser for plain text or non-TypeScript files.

**Use for:** JavaScript, JSON, YAML, or any plain text files.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { defaultParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(defaultParser)
```

## How Parsers Work

Parsers are registered with `fabric.use()` and automatically selected based on file extensions during `fabric.write()`.

**Example:** Register multiple parsers for different file types.

```typescript twoslash
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser, tsxParser, defaultParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Register parsers for different file types
fabric.use(typescriptParser)  // Handles .ts files
fabric.use(tsxParser)          // Handles .tsx files
fabric.use(defaultParser)      // Handles all other files
```

**How selection works:**
1. Fabric checks the file extension (e.g., `.ts`, `.tsx`)
2. Selects the parser whose `extNames` match the extension
3. Calls the parser's `parse()` function to generate file content

## Common Use Cases

### TypeScript Type Generation
Use `typescriptParser` for generating type definitions, interfaces, and constants.

```ts
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'types.ts',
  path: './generated/types.ts',
  sources: [
    { value: 'export type User = { id: number }', isExportable: true }
  ],
  imports: [],
  exports: []
})
```

### React Component Generation
Use `tsxParser` for JSX/React components.

```ts
fabric.use(tsxParser)

await fabric.addFile({
  baseName: 'Button.tsx',
  path: './components/Button.tsx',
  sources: [
    { value: 'export const Button = () => <button>Click</button>', isExportable: true }
  ],
  imports: [],
  exports: []
})
```

### Multi-Format Output
Register multiple parsers for different file types in the same project.

```ts
fabric.use(typescriptParser)
fabric.use(tsxParser)
fabric.use(defaultParser)

await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
    '.js': '.js'
  }
})
```

## Next Steps

- [TypeScript Parser](/parsers/typescript-parser) - Format `.ts` files
- [TSX Parser](/parsers/tsx-parser) - Format `.tsx` files with JSX
- [Default Parser](/parsers/default-parser) - Plain text parser
- [Creating Custom Parsers](/guide/creating-parsers) - Build your own

## FAQ

### Which parser should I use?

- Use `typescriptParser` for `.ts` files (types, functions, constants)
- Use `tsxParser` for `.tsx` files (React components, JSX templates)
- Use `defaultParser` for plain text, JSON, or other formats

### Can I register multiple parsers?

Yes, register multiple parsers for different file types. Fabric selects the correct parser based on file extension.

### How do I create a custom parser?

See [Creating Custom Parsers](/guide/creating-parsers) for a complete guide.

### What if no parser matches my file extension?

Fabric uses the `defaultParser` as a fallback for unrecognized extensions.

## Related Resources

- [Creating Parsers](/guide/creating-parsers) - Build custom parsers
- [Configuration Guide](/getting-started/configure) - Configure parsers
- [Core API](/core) - Fabric Core overview
