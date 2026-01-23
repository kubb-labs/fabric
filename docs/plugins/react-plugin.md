---
layout: doc
title: reactPlugin
outline: deep
---

# reactPlugin

The `reactPlugin` enables rendering React components to the terminal or to a string. This plugin is useful for building CLI UIs, generating templates, and creating interactive command-line applications.

## Installation

The reactPlugin is included in `@kubb/react-fabric`:

```ts [example.ts]
import { reactPlugin } from '@kubb/react/plugins'
```

## Usage

### Basic Example

```ts [example.tsx]
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react/plugins'
import React from 'react'

const fabric = createFabric()

fabric.use(reactPlugin)

const App = () => {
  return <div>Hello from React!</div>
}

await fabric.render(App)
await fabric.waitUntilExit()
```

### Render to String

Use `renderToString` to generate template output without writing to stdout:

```ts [template.tsx]
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react/plugins'
import React from 'react'

const fabric = createFabric()

fabric.use(reactPlugin)

const Template = ({ name }: { name: string }) => {
  return <div>export const {name} = 'value'</div>
}

const output = await fabric.renderToString(() => <Template name="config" />)
console.log(output) // "export const config = 'value'"
```

## Options

| Option   | Type                      | Required | Default | Description                                                              |
|----------|---------------------------|----------|---------|--------------------------------------------------------------------------|
| `stdout` | `NodeJS.WriteStream`      | No       | -       | Output stream for rendered content. If set, output is written progressively. |
| `stdin`  | `NodeJS.ReadStream`       | No       | -       | Input stream for interactive components.                                  |
| `stderr` | `NodeJS.WriteStream`      | No       | -       | Error output stream.                                                      |
| `debug`  | `boolean`                 | No       | `false` | Log render/unmount information to console for debugging.                  |

### `stdout`

Specify a custom output stream for rendered content:

```ts [example.ts]
import { createWriteStream } from 'fs'

fabric.use(reactPlugin, {
  stdout: createWriteStream('./output.txt'),
})
```

### `stdin` and `stderr`

Configure input and error streams for interactive components:

```ts [example.ts]
fabric.use(reactPlugin, {
  stdin: process.stdin,
  stderr: process.stderr,
})
```

### `debug`

Enable debug mode to log render lifecycle information:

```ts [example.ts]
fabric.use(reactPlugin, {
  debug: true, // Logs render/unmount events
})
```

## Injected Methods

The reactPlugin adds the following methods to the Fabric instance:

### `render(App)`

Renders a React component tree to the terminal and emits the `lifecycle:start` event.

**Signature:**

```ts
render(App: React.ElementType): Promise<void> | void
```

**Example:**

```tsx [app.tsx]
const App = () => <div>Building files...</div>

await fabric.render(App)
```

### `renderToString(App)`

Renders a React component tree and returns the final output as a string without writing to stdout.

**Signature:**

```ts
renderToString(App: React.ElementType): Promise<string> | string
```

**Example:**

```tsx [template.tsx]
const Template = () => <div>Generated code</div>

const output = await fabric.renderToString(Template)
console.log(output)
```

### `waitUntilExit()`

Waits until the rendered app exits. Resolves when the component unmounts and emits the `lifecycle:end` event.

**Signature:**

```ts
waitUntilExit(): Promise<void>
```

**Example:**

```tsx [app.tsx]
await fabric.render(App)
await fabric.waitUntilExit() // Wait for app to finish
console.log('App completed')
```

## How It Works

The reactPlugin:

1. Registers React rendering capabilities with Fabric
2. Listens to lifecycle events (`lifecycle:render`)
3. Renders React components to terminal or string
4. Manages component lifecycle (mount/unmount)

## Use Cases

### CLI Progress UI

Build interactive command-line interfaces with React components:

```tsx [progress.tsx]
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react/plugins'
import React, { useState, useEffect } from 'react'

const fabric = createFabric()

fabric.use(reactPlugin)

const Progress = () => {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 100))
    }, 100)
    return () => clearInterval(interval)
  }, [])
  
  return <div>Progress: {progress}%</div>
}

await fabric.render(Progress)
await fabric.waitUntilExit()
```

### Template Generation

Generate code templates using React components:

```tsx [codegen.tsx]
const TypeTemplate = ({ name, fields }: Props) => {
  return (
    <div>
      export interface {name} {'{'}
      {fields.map(f => (
        <div key={f}>  {f}: string;</div>
      ))}
      {'}'}
    </div>
  )
}

const code = await fabric.renderToString(() => (
  <TypeTemplate name="User" fields={['id', 'name', 'email']} />
))
```

### Interactive Prompts

Create interactive CLI tools with user input:

```tsx [interactive.tsx]
fabric.use(reactPlugin, {
  stdin: process.stdin,
  stdout: process.stdout,
})

const Interactive = () => {
  return <div>Select an option: [y/n]</div>
}

await fabric.render(Interactive)
```

## See Also

- [createFabric](/core/create-fabric/) - Fabric API reference
- [Events](/core/events/) - Lifecycle events
- [Creating Plugins](/guide/creating-plugins/) - Build custom plugins
