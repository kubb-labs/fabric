---
layout: doc
title: Parsers
outline: deep
---

# Parsers

Fabric uses parsers to transform generated code into the correct format. Parsers handle imports, exports, formatting, and language-specific syntax transformations.

## Available Parsers

### [typescriptParser](/parsers/typescript-parser)

Parse and format TypeScript files with import/export handling.

The TypeScript parser formats TypeScript code, organizes imports and exports, and ensures consistent code style across generated files.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(typescriptParser)
```

### [tsxParser](/parsers/tsx-parser)

Parse and format TSX (TypeScript + JSX) files.

Extends the TypeScript parser to support JSX syntax, making it suitable for React components and JSX-based code generation.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(tsxParser)
```

### [defaultParser](/parsers/default-parser)

Basic parser for non-TypeScript files.

A fallback parser for files that don't require TypeScript-specific processing, such as plain JavaScript, JSON, or other text files.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { defaultParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(defaultParser)
```

## Example

Parsers are registered with your Fabric instance to handle specific file types:

```typescript twoslash
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser, tsxParser, defaultParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Register parsers for different file types
fabric.use(typescriptParser)
fabric.use(tsxParser)
fabric.use(defaultParser)
```
