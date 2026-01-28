---
layout: doc
title: fsxPlugin
outline: deep
---

# `fsxPlugin`

The `fsxPlugin` enables rendering FabricElements to generate file output. This plugin provides the core rendering capabilities for transforming component trees into file content, making it essential for file-based code generation workflows.


## Usage
Create a component that returns `hello from Fabric!` and render it using the `fsxPlugin`.

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { createComponent } from '@kubb/fabric-core'

const fabric = createFabric()

fabric.use(fsxPlugin)

const App = createComponent('App', () => {
  return 'Hello from Fabric!'
})

const output = await fabric.render(App())
```

```ts [output]
"Hello from Fabric!"
```
:::

## Options

### `treeNode`

Provide a custom tree node to track the component hierarchy:

|           |                                 |
|----------:|:--------------------------------|
|     Type: | `TreeNode<ComponentNode>`       |
| Required: | `false`                         |
|  Default: | `new TreeNode<ComponentNode>()` |

### `debug`

Enable debug mode to see render output in the console:

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |


## Injected Methods

The `fsxPlugin` adds the following methods to the Fabric instance:

### `render(App)`

Renders a FabricElement component tree and returns the output as a string.
This method also emits the `lifecycle:start` event.

**Signature:**

```ts
render(App: FabricElement<any>): Promise<string>
```

### `waitUntilExit()`

Waits until the rendering process exits. This method is useful for ensuring that all asynchronous rendering operations complete before proceeding.

**Signature:**

```ts
waitUntilExit(): Promise<void>
```

## `createComponent`

The `createComponent` helper allows you to build reusable components for code generation:

::: code-group

```tsx twoslash [component-example.ts]
import { createComponent, Const } from '@kubb/fabric-core'

const MyConst = createComponent('MyConst', ({ name }: { name: string }) => {
  return Const({ name, children: '"hello"' })
})

const output = MyConst({ name: 'greeting' })()
```

```ts twoslash [component-with-children.ts]
import { createComponent, Const } from '@kubb/fabric-core'

const MyConst = createComponent('MyConst', ({ name }: { name: string }) => {
  return Const({ name }).children('"hello"')
})

const output = MyConst({ name: 'greeting' })()
```


```ts [output]
const greeting = "hello"
```
:::

## Examples

### Code Generation from Templates

Generate TypeScript code using component composition:

::: code-group

```tsx twoslash [run.ts]
import { createFabric, Type, Const, File, createComponent, Br } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

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
      Br(),
      Const({
        name: `default${name}`,
        export: true,
        type: name,
        children: `{ ${fields.map(f => `${f.name}: undefined`).join(', ')} }`,
      }),
      Br()
    ],
  })
})

const fabric = createFabric()

fabric.use(fsxPlugin)

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

```ts [output]
export type User = { id: number; name: string; email: string }
export const defaultUser: User = { id: undefined, name: undefined, email: undefined }
```

:::

### Building Component Libraries

Create reusable components for consistent code generation:

::: code-group

```tsx twoslash [run.ts]
import { createFabric, Type, Const, File, createComponent, Br } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

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
const fabric = createFabric()

fabric.use(fsxPlugin)

const output = await fabric.render(ApiEndpoint({ name: 'user', path: '/api/users' }))
```

```ts [output]
export const USER_ENDPOINT = '/api/users' as const
```

:::

## See Also

- [createFabric](/core/create-fabric/) - Fabric API reference
- [fsPlugin](/plugins/fs-plugin/) - Write files to disk
- [Creating Plugins](/guide/creating-plugins/) - Build custom plugins
- [File Generation Patterns](/guide/file-generation-patterns/) - Best practices
