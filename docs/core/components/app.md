---
layout: doc
title: App (Fabric Core)
outline: deep
---

# `App` <Badge type="info" text="fabric-core" />

Container component providing App context with metadata.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [App (React Fabric)](/react/components/app).

## Usage

::: code-group

```ts twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { App, File } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const Component = App().children([
  File({ baseName: 'user.ts', path: './generated/user.ts' })
  .children(
    File.Source().children(['export type User = { id: number }'])
  )
])

const output = await fabric.render(Component)
```

```ts [output]
export type User = { id: number };
```
:::

## Props

### meta

Metadata attached to the App context.

|           |        |
|----------:|:-------|
|     Type: | `TMeta` |
| Required: | `false` |
|  Default: | `{}`    |

## See Also

- [App (React Fabric)](/react/components/app) - React version
- [File](/core/components/file) - File generation component
- [createFabric](/core/create-fabric) - Create Fabric instance
