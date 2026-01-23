---
layout: doc
title: File Generation Patterns
outline: deep
---

# File Generation Patterns

Best practices and patterns for generating files with Fabric.

## Basic Patterns

### Single File Generation

Generate a standalone file:

```ts [single-file.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'config.ts',
  path: './output/config.ts',
  sources: [
    { value: 'export const API_URL = "https://api.example.com"', isExportable: true },
  ],
})

await fabric.write({ extension: { '.ts': '.ts' } })
```

### Multiple Related Files

Generate multiple files with shared types:

```ts [related-files.ts]
// Types file
await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
})

// API file that imports types
await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  imports: [
    { name: 'User', path: './types', isTypeOnly: true },
  ],
  sources: [
    { value: 'export const getUser = (): Promise<User> => fetch("/user").then(r => r.json())', isExportable: true },
  ],
})
```

## Organizational Patterns

### Feature-Based Organization

Organize files by feature:

```ts [feature-based.ts]
// User feature
await fabric.addFile({
  baseName: 'types.ts',
  path: './output/features/user/types.ts',
  sources: [/* user types */],
})

await fabric.addFile({
  baseName: 'api.ts',
  path: './output/features/user/api.ts',
  sources: [/* user API */],
})

// Post feature
await fabric.addFile({
  baseName: 'types.ts',
  path: './output/features/post/types.ts',
  sources: [/* post types */],
})

await fabric.addFile({
  baseName: 'api.ts',
  path: './output/features/post/api.ts',
  sources: [/* post API */],
})
```

### Layer-Based Organization

Separate by architectural layers:

```ts [layer-based.ts]
// Types layer
await fabric.addFile({
  baseName: 'user.ts',
  path: './output/types/user.ts',
  sources: [/* types */],
})

// Services layer
await fabric.addFile({
  baseName: 'user-service.ts',
  path: './output/services/user-service.ts',
  sources: [/* service */],
})

// API layer
await fabric.addFile({
  baseName: 'user-api.ts',
  path: './output/api/user-api.ts',
  sources: [/* API */],
})
```

## Code Generation Patterns

### Template-Based Generation

Use functions to generate repetitive code:

```ts [template-based.ts]
function generateModel(name: string, props: Array<{ name: string; type: string }>) {
  const properties = props.map(p => `  ${p.name}: ${p.type}`).join('\n')
  return `export type ${name} = {\n${properties}\n}`
}

const models = [
  { name: 'User', props: [{ name: 'id', type: 'number' }] },
  { name: 'Post', props: [{ name: 'id', type: 'number' }] },
]

for (const model of models) {
  await fabric.addFile({
    baseName: `${model.name.toLowerCase()}.ts`,
    path: `./output/models/${model.name.toLowerCase()}.ts`,
    sources: [
      { value: generateModel(model.name, model.props), isExportable: true },
    ],
  })
}
```

### Schema-Driven Generation

Generate from a schema definition:

```ts [schema-driven.ts]
const schema = {
  entities: [
    { name: 'User', fields: ['id', 'name', 'email'] },
    { name: 'Post', fields: ['id', 'title', 'content'] },
  ],
}

for (const entity of schema.entities) {
  // Generate type
  await fabric.addFile({
    baseName: `${entity.name}.ts`,
    path: `./output/types/${entity.name}.ts`,
    sources: [
      { value: generateTypeFromEntity(entity), isExportable: true },
    ],
  })
  
  // Generate CRUD operations
  await fabric.addFile({
    baseName: `${entity.name}Service.ts`,
    path: `./output/services/${entity.name}Service.ts`,
    sources: [
      { value: generateCRUD(entity), isExportable: true },
    ],
  })
}
```

## Import/Export Patterns

### Centralized Exports

Create barrel files for clean imports:

```ts [barrel-pattern.ts]
import { barrelPlugin } from '@kubb/fabric-core/plugins'

fabric.use(barrelPlugin, {
  root: './output',
  mode: 'named',
})

// Generate files
await fabric.addFile({
  baseName: 'user.ts',
  path: './output/models/user.ts',
  sources: [/* ... */],
})

await fabric.addFile({
  baseName: 'post.ts',
  path: './output/models/post.ts',
  sources: [/* ... */],
})

await fabric.write()

// Create entry barrel
await fabric.writeEntry('./output', 'named')

// Now you can import: import { User, Post } from './output'
```

### Type-Only Imports

Use type-only imports for better tree-shaking:

```ts [type-imports.ts]
await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  imports: [
    { name: 'User', path: './types/user', isTypeOnly: true },
    { name: 'axios', path: 'axios', isTypeOnly: false },
  ],
  sources: [
    { value: 'export const getUser = (): Promise<User> => axios.get("/user")', isExportable: true },
  ],
})
```

## Performance Patterns

### Batch File Generation

Add files in batches for better performance:

```ts [batch-generation.ts]
const files = Array.from({ length: 100 }, (_, i) => ({
  baseName: `file${i}.ts`,
  path: `./output/file${i}.ts`,
  sources: [{ value: `export const x${i} = ${i}`, isExportable: true }],
}))

// Add all files at once
await Promise.all(files.map(f => fabric.addFile(f)))

await fabric.write()
```

### Conditional Generation

Generate files only when needed:

```ts [conditional-generation.ts]
const shouldGenerateTests = process.env.GENERATE_TESTS === 'true'

for (const model of models) {
  // Always generate types
  await fabric.addFile({
    baseName: `${model.name}.ts`,
    path: `./output/types/${model.name}.ts`,
    sources: [/* ... */],
  })
  
  // Conditionally generate tests
  if (shouldGenerateTests) {
    await fabric.addFile({
      baseName: `${model.name}.test.ts`,
      path: `./output/tests/${model.name}.test.ts`,
      sources: [/* ... */],
    })
  }
}
```

## Error Handling Patterns

### Validation Before Generation

Validate files before writing:

```ts [validation-pattern.ts]
fabric.context.on('files:writing:start', ({ files }) => {
  for (const file of files) {
    if (!file.path) {
      throw new Error(`File missing path: ${file.baseName}`)
    }
    
    if (file.sources.length === 0) {
      console.warn(`Warning: File has no sources: ${file.baseName}`)
    }
  }
})
```

### Graceful Degradation

Handle errors without stopping generation:

```ts [graceful-degradation.ts]
const models = [/* ... */]

for (const model of models) {
  try {
    await fabric.addFile({
      baseName: `${model.name}.ts`,
      path: `./output/${model.name}.ts`,
      sources: [{ value: generateType(model), isExportable: true }],
    })
  } catch (error) {
    console.error(`Failed to generate ${model.name}:`, error)
    // Continue with next model
  }
}
```

## Testing Patterns

### Dry Run Testing

Test generation without creating files:

```ts [dry-run-test.ts]
import { fsPlugin } from '@kubb/fabric-core/plugins'

fabric.use(fsPlugin, {
  dryRun: true,
  onBeforeWrite: (path, data) => {
    console.log(`Would write: ${path}`)
    // Assert data is correct
    if (!data || data.length === 0) {
      throw new Error(`Empty file: ${path}`)
    }
  },
})
```

### Snapshot Testing

Capture generated output for comparison:

```ts [snapshot-test.ts]
const outputs: Record<string, string> = {}

fabric.use(fsPlugin, {
  dryRun: true,
  onBeforeWrite: (path, data) => {
    outputs[path] = data || ''
  },
})

await fabric.write()

// Compare with expected snapshots
expect(outputs['./output/user.ts']).toMatchSnapshot()
```

## Best Practices

1. **Clean before generation** — Always clean the output directory
2. **Use barrel files** — Simplify imports with index files
3. **Type-only imports** — Better tree-shaking and build performance
4. **Validate early** — Check file configuration before writing
5. **Batch operations** — Add multiple files at once for performance
6. **Error handling** — Handle errors gracefully without stopping generation
7. **Dry run testing** — Test generation without creating files

## See Also

- [createFabric](/api/core/create-fabric) — Fabric API
- [barrelPlugin](/api/plugins/barrel-plugin) — Barrel file generation
- [fsPlugin](/api/plugins/fs-plugin) — File system operations
- [Creating Plugins](/guide/creating-plugins) — Custom plugins
