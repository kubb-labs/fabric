---
layout: doc
title: Root (Fabric Core)
outline: deep
---

# `Root` <Badge type="info" text="fabric-core" />

Provides core Fabric runtime context.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Root (React Fabric)](/react/components/root).

> [!WARNING]
> The Root component is typically used internally by the Fabric runtime.
> You don't need to use it directly in most cases.

## Props

### onExit

Callback to exit the application.

|           |                           |
|----------:|:--------------------------|
|     Type: | `(error?: Error) => void` |
| Required: | `true`                    |

### onError

Error handler for runtime exceptions.

|           |                      |
|----------:|:---------------------|
|     Type: | `(error: Error) => void` |
| Required: | `true`               |

### treeNode

Tree structure for component hierarchy.

|           |                               |
|----------:|:------------------------------|
|     Type: | `TreeNode<ComponentNode>`     |
| Required: | `true`                        |

### fileManager

FileManager instance.

|           |               |
|----------:|:--------------|
|     Type: | `FileManager` |
| Required: | `true`        |

### children

Child components.

|           |             |
|----------:|:------------|
|     Type: | `FabricNode` |
| Required: | `false`     |

## Internal Usage

The Root component is automatically used by the fsxPlugin runtime. You typically won't create it directly.

```ts
// The runtime creates Root internally
await fabric.render(component)
// Root is automatically wrapped around your component
```

## See Also

- [Root (React Fabric)](/react/components/root) - React version
- [App](/core/components/app) - App container component
- [createFabric](/core/create-fabric) - Fabric factory
