---
layout: doc
title: App Component - Application Container for Fabric
description: Use the App component as a container for file generation with metadata. Provides App context to child components.
outline: deep
---

# App <Badge type="info" text="fabric-core" />

The App component provides an application container with metadata context for file generation. Use it as a top-level wrapper for File components.

**Use App when:** You need to pass metadata to multiple File components or provide application-level context.

**Perfect for:** Multi-file generators that need shared configuration or metadata.

> [!NOTE]
> This is the **Fabric Core** version using the functional API.
> For the React version, see [App (React Fabric)](/react/components/app).

## Usage

Wrap File components with App to provide metadata context.

**Example:** Create an app container with a file.

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

## Component Props

### meta

Metadata attached to the App context.

|           |        |
|----------:|:-------|
|     Type: | `TMeta` |
| Required: | `false` |
|  Default: | `{}`    |

## Next Steps

- [File Component](/core/components/file) - Generate files
- [useApp Hook](/core/composables/use-app) - Access App context
- [Quick Start](/getting-started/quick-start) - Build a generator

## FAQ

### When should I use App vs File directly?

Use App when you need to share metadata across multiple files. Use File directly for single-file generation.

### Can I nest App components?

No, use a single App component as the top-level container.

## Related Resources

- [App (React Fabric)](/react/components/app) - React version
- [File](/core/components/file) - File generation component
- [createFabric](/core/create-fabric) - Create Fabric instance
