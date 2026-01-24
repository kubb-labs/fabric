---
layout: doc
title: App (Fabric Core)
outline: deep
---

# App <Badge type="info" text="fabric-core" />

Container component providing App context with metadata.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [App (React Fabric)](/react/components/app).

## Package

```bash
@kubb/fabric-core
```

## Usage

Uses Fabric's functional API (not JSX):

```ts [basic-app.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { App, File } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = App().children([
  File({ baseName: 'user.ts', path: './generated/user.ts' }).children([
    'export type User = { id: number }'
  ])
])

const output = await fabric.render(component)
```

## Props

### meta

Metadata attached to the App context.

|           |        |
|----------:|:-------|
|     Type: | `TMeta` |
| Required: | `false` |
|  Default: | `{}`    |

## With Metadata

```ts [with-meta.ts]
import { App } from '@kubb/fabric-core'

const component = App({ 
  meta: { 
    version: '1.0.0', 
    author: 'Code Generator' 
  } 
}).children([
  // Your components
])

const output = await fabric.render(component)
```

## See Also

- [App (React Fabric)](/react/components/app) - React version
- [File](/core/components/file) - File generation component
- [createFabric](/core/create-fabric) - Create Fabric instance
