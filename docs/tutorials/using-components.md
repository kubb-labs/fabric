---
layout: doc
title: Using Components (FSX)
outline: deep
---

# Tutorial: Using Components (FSX)

Learn how to generate code using Fabric's component-based syntax.

> [!NOTE]
> This tutorial shows an alternative to the imperative API. Complete [Getting Started](/tutorials/getting-started) first.

## What Are Components?

Components provide a declarative way to generate code with better TypeScript support and composition.

## Step 1: Generate a Type

Create a TypeScript type using the `Type` component:

::: code-group

```tsx twoslash [run.ts]
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Type, createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const userType = Type({
  name: 'User',
  export: true,
}).children([
  '{ id: number; name: string; email: string }'
])

const output = await fabric.render(userType)
```

```ts [output]
export type User = { id: number; name: string; email: string }

```

:::


## Step 2: Create a File

Use the `File` component to organize code:

::: code-group

```tsx twoslash [run.ts]
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { File, Type, createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'user.ts',
  path: './generated/user.ts',
}).children([
  File.Source({ isExportable: true }).children([
    Type({ name: 'User', export: true }).children([
      '{ id: number; name: string; email: string }'
    ])
  ])
])

const output = await fabric.render(component)
```

```ts [output]
export type User = { id: number; name: string; email: string }
```

:::

## Step 3: Add Imports and Functions

::: code-group

```tsx twoslash [run.ts]
import { File, Br, Function, createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsxPlugin)

const component = File({
  baseName: 'api.ts',
  path: './generated/api.ts',
}).children([
  File.Import({
    name: 'User',
    path: './user',
    isTypeOnly: true,
  }),
  File.Source({ isExportable: true }).children([
    Function({
      name: 'fetchUser',
      export: true,
      async: true,
      params: 'id: number',
      returnType: 'Promise<User>',
    }).children([
      'const response = await fetch(`/api/users/${id}`)',
      Br(),
      'return response.json()',
    ])
  ])
])

const output = await fabric.render(component)
```

```ts [output]
import type { User } from './user'

export async function fetchUser(id: number): Promise<User> {
const response = await fetch(`/api/users/${id}`)
return response.json()
}
```

:::

## Step 4: Generate Multiple Files

Use the `Fabric` component for multiple files:

::: code-group

```tsx twoslash [run.ts]
import { Fabric, File, Br, Type, createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsxPlugin)

const models = ['User', 'Post', 'Comment']

const component = Fabric().children(
  models.map(name =>
    File({
      baseName: `${name.toLowerCase()}.ts`,
      path: `./generated/${name.toLowerCase()}.ts`,
    }).children([
      File.Source({ isExportable: true }).children([
        Type({ name, export: true }).children(['{ id: number }']),
        Br()
      ])
    ])
  )
)

const output = await fabric.render(component)
```

```ts [output]
export type User = { id: number }
export type Post = { id: number }
export type Comment = { id: number }
```

:::

## Available Components

| Component | Purpose |
|-----------|---------|
| `Fabric` | Container for multiple files |
| `File` | File with imports/exports/source |
| `Type` | Type declaration |
| `Function` | Function declaration |
| `Const` | Constant declaration |
| `Br` | Line break |
| `Indent` / `Dedent` | Control indentation |


## Next Steps

- **[Core Components](/core/components/file)** - Detailed component docs
- **[Quick Start](/getting-started/quick-start)** - Learn about plugins
- **[Creating Plugins](/guide/creating-plugins)** - Extend Fabric
