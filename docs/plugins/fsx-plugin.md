---
layout: doc
title: fsxPlugin
outline: deep
---

# fsxPlugin

The `fsxPlugin` enables rendering FabricElements to generate file output. This plugin provides the core rendering capabilities for transforming component trees into file content, making it essential for file-based code generation workflows.


## Usage

### Basic Example

```ts [example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { createComponent } from '@kubb/fabric-core'

const fabric = createFabric()

fabric.use(fsxPlugin)

const App = createComponent('App', () => {
  return 'Hello from Fabric!'
})

const output = await fabric.render(App())
console.log(output) // "Hello from Fabric!"
```

### With File Generation

```ts [file-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin, fsPlugin } from '@kubb/fabric-core/plugins'
import { File } from '@kubb/fabric-core/components'

const fabric = createFabric()

fabric.use(fsxPlugin)
fabric.use(fsPlugin)

const output = await fabric.render(
  File({
    baseName: 'user.ts',
    path: './user.ts',
    children: File.Source({
      children: 'export type User = { id: number; name: string }',
    }),
  })
)

await fabric.write()
```

### Using createComponent Helper

The `createComponent` helper allows you to build reusable components for code generation:

```ts [component-example.ts]
import { createComponent } from '@kubb/fabric-core'
import { Const } from '@kubb/fabric-core/components'

// Without children
const MyConst = createComponent('MyConst', ({ name }: { name: string }) => {
  return Const({ name, children: '"hello"' })
})

const output = MyConst({ name: 'greeting' })()
// Output: const greeting = "hello"
```

```ts [component-with-children.ts]
import { createComponent } from '@kubb/fabric-core'
import { File } from '@kubb/fabric-core/components'

// With children
const MyFile = createComponent('MyFile', ({ baseName, path }: { baseName: string; path: string }) => {
  return File({
    baseName,
    path,
    children: File.Source({
      children: 'const test = 1;',
    }),
  })
})

const output = MyFile({ baseName: 'test.ts', path: './test.ts' })()
```

## Options

| Option      | Type                              | Required | Default | Description                                                                |
|-------------|-----------------------------------|----------|---------|----------------------------------------------------------------------------|
| `treeNode`  | `TreeNode<ComponentNode>`         | No       | -       | Custom tree node for tracking component hierarchy during rendering.       |
| `debug`     | `boolean`                         | No       | `false` | Set to `true` to log render results to the console for debugging.         |

### `treeNode`

Provide a custom tree node to track the component hierarchy:

```ts [tree-example.ts]
import { TreeNode } from '@kubb/fabric-core/utils'
import type { ComponentNode } from '@kubb/fabric-core'

const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })

fabric.use(fsxPlugin, { treeNode })

// After rendering, inspect the tree
console.log(treeNode.children)
```

### `debug`

Enable debug mode to see render output in the console:

```ts [debug-example.ts]
fabric.use(fsxPlugin, {
  debug: true, // Logs render results line-by-line
})
```

## Injected Methods

The fsxPlugin adds the following methods to the Fabric instance:

### `render(App)`

Renders a FabricElement component tree and returns the output as a string. This method also emits the `lifecycle:start` event.

**Signature:**

```ts
render(App: FabricElement<any>): Promise<string>
```

**Example:**

```ts [render-example.ts]
import { createComponent } from '@kubb/fabric-core'

const App = createComponent('App', () => {
  return 'const value = "hello"'
})

const output = await fabric.render(App())
console.log(output) // "const value = "hello""
```

### `waitUntilExit()`

Waits until the rendering process exits. This method is useful for ensuring that all asynchronous rendering operations complete before proceeding.

**Signature:**

```ts
waitUntilExit(): Promise<void>
```

**Example:**

```ts [wait-example.ts]
await fabric.render(App())
await fabric.waitUntilExit()
console.log('Rendering completed')
```

## How It Works

The fsxPlugin:

1. Registers rendering capabilities with Fabric
2. Creates a Runtime instance to handle component rendering
3. Emits `lifecycle:start` event when rendering begins
4. Transforms FabricElements into string output
5. Manages the rendering lifecycle with exit handling

## Examples with Built-in Components

### Using Const Component

The `Const` component generates constant declarations:

```ts [const-example.ts]
import { Const } from '@kubb/fabric-core/components'
import { createComponent } from '@kubb/fabric-core'

// Basic const
const output1 = Const({ name: 'myVar', children: '"hello"' })()
// Output: const myVar = "hello"

// Exported const
const output2 = Const({ name: 'myVar', export: true, children: '"hello"' })()
// Output: export const myVar = "hello"

// Const with type
const output3 = Const({ name: 'myVar', type: 'string', children: '"hello"' })()
// Output: const myVar: string = "hello"

// Const with as const
const output4 = Const({ name: 'myVar', asConst: true, children: '"hello"' })()
// Output: const myVar = "hello" as const

// Const with JSDoc
const output5 = Const({
  name: 'myVar',
  JSDoc: { comments: ['This is a variable'] },
  children: '"hello"',
})()
// Output:
// /**
//  * This is a variable
//  */
// const myVar = "hello"

// Using createComponent with Const
const MyConstComponent = createComponent('MyConst', () => {
  return Const({ name: 'greeting', export: true, children: '"Hello, World!"' })
})

const output = await fabric.render(MyConstComponent())
```

### Using Type Component

The `Type` component generates TypeScript type declarations:

```ts [type-example.ts]
import { Type } from '@kubb/fabric-core/components'
import { createComponent } from '@kubb/fabric-core'

// Basic type
const output1 = Type({ name: 'MyType', children: '{ a: string }' })()
// Output: type MyType = { a: string }

// Exported type
const output2 = Type({ name: 'MyType', export: true, children: '{ a: string }' })()
// Output: export type MyType = { a: string }

// Type with JSDoc
const output3 = Type({
  name: 'MyType',
  JSDoc: { comments: ['User type definition'] },
  children: '{ id: number; name: string }',
})()
// Output:
// /**
//  * User type definition
//  */
// type MyType = { id: number; name: string }

// Using createComponent with Type
const MyTypeComponent = createComponent('MyType', () => {
  return Type({
    name: 'UserType',
    export: true,
    children: '{ id: number; name: string; email: string }',
  })
})

const output = await fabric.render(MyTypeComponent())
```

### Using File Component

The `File` component manages file generation with imports, exports, and sources:

```ts [file-example.ts]
import { File } from '@kubb/fabric-core/components'
import { createComponent } from '@kubb/fabric-core'

// Basic file
await fabric.render(
  File({
    baseName: 'user.ts',
    path: './user.ts',
    children: File.Source({
      children: 'export type User = { id: number }',
    }),
  })
)

// File with imports
await fabric.render(
  File({
    baseName: 'api.ts',
    path: './api.ts',
    children: [
      File.Import({ name: 'User', path: './user.ts' }),
      File.Source({ children: 'export const getUser = (): User => ({ id: 1 })' }),
    ],
  })
)

// File with exports
await fabric.render(
  File({
    baseName: 'index.ts',
    path: './index.ts',
    children: File.Export({ name: 'User', path: './user.ts' }),
  })
)

// Multiple files using createComponent
const FileGenerator = createComponent('FileGenerator', () => {
  return [
    File({
      baseName: 'file1.ts',
      path: './file1.ts',
      children: File.Source({ children: 'const test = 1;' }),
    }),
    File({
      baseName: 'file2.ts',
      path: './file2.ts',
      children: File.Source({ children: 'const test = 2;' }),
    }),
    File({
      baseName: 'file3.ts',
      path: './file3.ts',
      children: File.Source({ children: 'const test = 3;' }),
    }),
  ]
})

await fabric.render(FileGenerator())

// Access generated files
const files = fabric.files
console.log(files.length) // 3
```

## Use Cases

### Code Generation from Templates

Generate TypeScript code using component composition:

```ts [codegen.ts]
import { createComponent } from '@kubb/fabric-core'
import { Type, Const, File } from '@kubb/fabric-core/components'

const ModelGenerator = createComponent('ModelGenerator', ({ name, fields }: {
  name: string
  fields: Array<{ name: string; type: string }>
}) => {
  return File({
    baseName: `${name.toLowerCase()}.ts`,
    path: `./${name.toLowerCase()}.ts`,
    children: [
      Type({
        name,
        export: true,
        children: `{ ${fields.map(f => `${f.name}: ${f.type}`).join('; ')} }`,
      }),
      Const({
        name: `default${name}`,
        export: true,
        type: name,
        children: `{ ${fields.map(f => `${f.name}: undefined`).join(', ')} }`,
      }),
    ],
  })
})

const output = await fabric.render(
  ModelGenerator({
    name: 'User',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
    ],
  })
)
```

### Building Component Libraries

Create reusable components for consistent code generation:

```ts [library.ts]
import { createComponent } from '@kubb/fabric-core'
import { Const } from '@kubb/fabric-core/components'

// Reusable API endpoint const generator
const ApiEndpoint = createComponent('ApiEndpoint', ({ name, path }: {
  name: string
  path: string
}) => {
  return Const({
    name: `${name.toUpperCase()}_ENDPOINT`,
    export: true,
    asConst: true,
    children: `'${path}'`,
  })
})

const output = await fabric.render(
  ApiEndpoint({ name: 'user', path: '/api/users' })
)
// Output: export const USER_ENDPOINT = '/api/users' as const
```

### Tree Tracking for Debugging

Track component hierarchy during rendering:

```ts [tree-tracking.ts]
import { TreeNode } from '@kubb/fabric-core/utils'
import type { ComponentNode } from '@kubb/fabric-core'
import { App } from '@kubb/fabric-core/components'
import { Const } from '@kubb/fabric-core/components'

const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })

fabric.use(fsxPlugin, { treeNode })

const component = App({
  meta: { name: 'TestApp' },
  children: Const({ name: 'myVar', children: '"hello"' }),
})

await fabric.render(component)

// Inspect the tree structure
console.log(treeNode.data.type) // 'Root'
console.log(treeNode.children[0]?.data.type) // 'App'
console.log(treeNode.children[0]?.children[0]?.data.type) // 'Const'
```

## See Also

- [createFabric](/core/create-fabric/) - Fabric API reference
- [fsPlugin](/plugins/fs-plugin/) - Write files to disk
- [Creating Plugins](/guide/creating-plugins/) - Build custom plugins
- [File Generation Patterns](/guide/file-generation-patterns/) - Best practices
