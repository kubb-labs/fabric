---
layout: doc
title: Fabric Component - Application Container for Fabric
description: Use the Fabric component as a container for file generation with metadata. Provides Fabric context to child components.
outline: deep
---

# Fabric <Badge type="info" text="fabric-core" />

The Fabric component provides an application container with metadata context for file generation. Use it as a top-level wrapper for File components.

**Use Fabric when:** You need to pass metadata to multiple File components or provide application-level context.

**Perfect for:** Multi-file generators that need shared configuration or metadata.

> [!NOTE]
> This is the **Fabric Core** version using the functional API.
> For the React version, see [Fabric (React Fabric)](/react/components/fabric).

## Usage

Wrap File components with Fabric to provide metadata context.

**Example:** Create an app container with a file.

::: code-group

```ts twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Fabric, File } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const Component = Fabric().children([
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

Metadata attached to the Fabric context.

|           |        |
|----------:|:-------|
|     Type: | `TMeta` |
| Required: | `false` |
|  Default: | `{}`    |

## Next Steps

- [File Component](/core/components/file) - Generate files
- [useFabric Hook](/core/composables/use-fabric) - Access Fabric context
- [Quick Start](/getting-started/quick-start) - Build a generator

## FAQ

### When should I use Fabric vs File directly?

Use Fabric when you need to share metadata across multiple files. Use File directly for single-file generation.

### Can I nest Fabric components?

No, use a single Fabric component as the top-level container.

## Related Resources

- [Fabric (React Fabric)](/react/components/fabric) - React version
- [File](/core/components/file) - File generation component
- [createFabric](/core/create-fabric) - Create Fabric instance
