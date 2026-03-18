---
layout: doc
title: Fabric Component - React Container for Fabric
description: Use the Fabric React component as a container for file generation with metadata using JSX syntax in Fabric.

outline: deep
---

# Fabric <Badge type="tip" text="react-fabric" />

React component providing Fabric context with metadata.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Fabric (Fabric Core)](/core/components/fabric).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, Fabric, File } from '@kubb/react-fabric'

const fabric = createReactFabric()

export function Generator() {
  return (
    <Fabric>
      <File baseName="user.ts" path="./generated/user.ts">
        <File.Source isExportable>
          export type User = {'{'} id: number {'}'}
        </File.Source>
      </File>
    </Fabric>
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

Metadata attached to the Fabric context.

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

- [Fabric (Fabric Core)](/core/components/fabric) - FSX version
- [File](/react/components/file) - File generation component
- [Overview](/getting-started/introduction#fabric-core-vs-react-fabric) - fabric-core vs react-fabric
