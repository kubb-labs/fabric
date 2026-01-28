---
layout: doc
title: App (React Fabric)
outline: deep
---

# `App` <Badge type="tip" text="react-fabric" />

React component providing App context with metadata.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [App (Fabric Core)](/core/components/app).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, App, File } from '@kubb/react-fabric'

const fabric = createReactFabric()

export function Generator() {
  return (
    <App>
      <File baseName="user.ts" path="./generated/user.ts">
        <File.Source isExportable>
          export type User = {'{'} id: number {'}'}
        </File.Source>
      </File>
    </App>
  )
}

const output = await fabric.renderToString(<Generator/>)
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

### children

Child React components.

|           |            |
|----------:|:-----------|
|     Type: | `KubbNode` |
| Required: | `false`    |

## See Also

- [App (Fabric Core)](/core/components/app) - FSX version
- [File](/react/components/file) - File generation component
- [Overview](/getting-started/introduction#fabric-core-vs-react-fabric) - fabric-core vs react-fabric
