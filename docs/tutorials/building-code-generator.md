---
layout: doc
title: Building a Code Generator
outline: deep
---

# Tutorial: Building a Code Generator

Build a complete TypeScript type generator from scratch using Fabric.

## What You'll Build

A code generator that creates TypeScript types and API client functions from a simple schema definition.

## Prerequisites

- Node.js 20 or higher
- Basic TypeScript knowledge
- Fabric installed (`@kubb/fabric-core`)

## Step 1: Project Setup

Create a new directory and initialize the project:

::: code-group

```bash [bun]
mkdir fabric-generator
cd fabric-generator
bun init -y
bun add -d @kubb/fabric-core typescript
```

```bash [pnpm]
mkdir fabric-generator
cd fabric-generator
pnpm init
pnpm add -D @kubb/fabric-core typescript
```

:::

Configure TypeScript:

```json [tsconfig.json]
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2023"],
    "strict": true,
    "esModuleInterop": true
  }
}
```

Add type module to package.json:

```json [package.json]
{
  "type": "module"
}
```

## Step 2: Define the Schema

Create a schema for your API:

```ts [schema.ts]
export const schema = {
  models: [
    {
      name: 'User',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'createdAt', type: 'Date' },
      ],
    },
    {
      name: 'Post',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'userId', type: 'number' },
      ],
    },
  ],
  endpoints: [
    { name: 'getUser', method: 'GET', path: '/users/:id', returns: 'User' },
    { name: 'getPosts', method: 'GET', path: '/posts', returns: 'Post[]' },
    { name: 'createPost', method: 'POST', path: '/posts', returns: 'Post' },
  ],
}

export type Schema = typeof schema
export type Model = Schema['models'][number]
export type Endpoint = Schema['endpoints'][number]
```

## Step 3: Generate Types

Create a function to generate TypeScript types:

```ts [generators/types.ts]
import type { Model } from '../schema'

export function generateType(model: Model): string {
  const properties = model.properties
    .map(prop => `  ${prop.name}: ${prop.type}`)
    .join('\n')
  
  return `export type ${model.name} = {\n${properties}\n}`
}
```

## Step 4: Generate API Client

Create a function to generate API client functions:

```ts [generators/api.ts]
import type { Endpoint } from '../schema'

export function generateApiFunction(endpoint: Endpoint): string {
  const params = endpoint.path.includes(':id') ? 'id: number' : ''
  const body = endpoint.method === 'POST' ? ', data: any' : ''
  
  return `export async function ${endpoint.name}(${params}${body}): Promise<${endpoint.returns}> {
  const response = await fetch('${endpoint.path.replace(':id', '${id}')}', {
    method: '${endpoint.method}',${body ? `\n    body: JSON.stringify(data),` : ''}
  })
  return response.json()
}`
}
```

## Step 5: Create the Generator

Build the main generator using Fabric:

```ts [generate.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin, barrelPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { schema } from './schema'
import { generateType } from './generators/types'
import { generateApiFunction } from './generators/api'

async function generate() {
  const fabric = createFabric()
  
  // Configure plugins
  fabric.use(loggerPlugin, { progress: true })
  fabric.use(barrelPlugin, { root: './generated', mode: 'named' })
  fabric.use(fsPlugin, { clean: { path: './generated' } })
  fabric.use(typescriptParser)
  
  // Generate type files
  for (const model of schema.models) {
    await fabric.addFile({
      baseName: `${model.name.toLowerCase()}.ts`,
      path: `./generated/types/${model.name.toLowerCase()}.ts`,
      sources: [
        { value: generateType(model), isExportable: true },
      ],
    })
  }
  
  // Generate API client file
  const apiSources = schema.endpoints.map(endpoint => ({
    value: generateApiFunction(endpoint),
    isExportable: true,
  }))
  
  // Add imports for types
  const imports = schema.endpoints.map(endpoint => {
    const returnType = endpoint.returns.replace('[]', '')
    return {
      name: returnType,
      path: `./types/${returnType.toLowerCase()}`,
      isTypeOnly: true,
    }
  })
  
  await fabric.addFile({
    baseName: 'api.ts',
    path: './generated/api/api.ts',
    imports,
    sources: apiSources,
  })
  
  // Write all files
  await fabric.write({ extension: { '.ts': '.ts' } })
  
  // Generate barrel files
  await fabric.writeEntry('./generated', 'named')
  
  console.log('✓ Generation complete!')
}

generate().catch(console.error)
```

## Step 6: Run the Generator

Execute the generator:

::: code-group

```bash [bun]
bun generate.ts
```

```bash [node]
node --loader tsx generate.ts
```

:::

## Step 7: Verify Output

Check the generated files:

```ts [generated/types/user.ts]
export type User = {
  id: number
  name: string
  email: string
  createdAt: Date
}
```

```ts [generated/types/post.ts]
export type Post = {
  id: number
  title: string
  content: string
  userId: number
}
```

```ts [generated/api/api.ts]
import type { User } from './types/user'
import type { Post } from './types/post'

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`/users/${id}`, {
    method: 'GET',
  })
  return response.json()
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch('/posts', {
    method: 'GET',
  })
  return response.json()
}

export async function createPost(data: any): Promise<Post> {
  const response = await fetch('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}
```

```ts [generated/index.ts]
export * from './types'
export * from './api'
```

## Step 8: Use Generated Code

Import and use the generated code in your app:

```ts [app.ts]
import { getUser, getPosts, type User, type Post } from './generated'

const user: User = await getUser(1)
console.log(user.name)

const posts: Post[] = await getPosts()
console.log(posts.length)
```

## Enhancements

### Add Validation

Add runtime validation to the generator:

```ts [validate.ts]
fabric.context.on('files:writing:start', ({ files }) => {
  for (const file of files) {
    if (!file.path || !file.baseName) {
      throw new Error('Invalid file configuration')
    }
  }
})
```

### Add Comments

Generate JSDoc comments:

```ts [with-comments.ts]
export function generateTypeWithComments(model: Model): string {
  const comment = `/**\n * ${model.name} model\n */`
  const type = generateType(model)
  return `${comment}\n${type}`
}
```

### Watch Mode

Add file watching for automatic regeneration:

```ts [watch.ts]
import { watch } from 'fs/promises'

async function watchAndGenerate() {
  const watcher = watch('./schema.ts')
  
  for await (const event of watcher) {
    console.log('Schema changed, regenerating...')
    await generate()
  }
}
```

## Key Takeaways

- Use `createFabric()` to initialize the generator
- Configure plugins for file writing, logging, and barrel exports
- Register parsers for file format handling
- Use `fabric.addFile()` to queue files
- Call `fabric.write()` to write files to disk
- Generate barrel files with `fabric.writeEntry()`

## Next Steps

<div class="vp-doc">
  <div class="vp-card-container">
    <a href="/guide/file-generation-patterns" class="vp-card">
      <h3>File Generation Patterns</h3>
      <p>Learn advanced patterns</p>
    </a>
    <a href="/guide/creating-plugins" class="vp-card">
      <h3>Creating Plugins</h3>
      <p>Build custom plugins</p>
    </a>
    <a href="/api/core/create-fabric" class="vp-card">
      <h3>API Reference</h3>
      <p>Explore the complete API</p>
    </a>
  </div>
</div>
