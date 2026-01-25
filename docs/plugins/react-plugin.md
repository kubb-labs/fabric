---
layout: doc
title: reactPlugin
outline: deep
---

# reactPlugin

The `reactPlugin` uses React and JSX syntax to create files.

## Usage

### Basic Example

```tsx twoslash
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'

const fabric = createFabric()

fabric.use(reactPlugin)

const App = () => {
  return <div>Hello from React!</div>
}

await fabric.render(App)
```

### Render to String

Use `renderToString` to generate template output without writing to stdout:

```tsx twoslash
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'

const fabric = createFabric()

fabric.use(reactPlugin)

const Template = ({ name }: { name: string }) => {
  return <div>export const {name} = 'value'</div>
}

const output = await fabric.renderToString(() => <Template name="config" />)
console.log(output) // "export const config = 'value'"
```

## Options

### `stdout`

Output stream for rendered content. If set, output is written progressively.

```ts [example.ts]
import { createWriteStream } from 'fs'

fabric.use(reactPlugin, {
  stdout: createWriteStream('./output.txt'),
})
```

### `stdin`

Configure input and error streams for interactive components:

```ts [example.ts]
fabric.use(reactPlugin, {
  stdin: process.stdin,
})
```

### `stderr`

Configure input and error streams for interactive components:

```ts [example.ts]
fabric.use(reactPlugin, {
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

**Example:**

```tsx [app.tsx]
const App = () => <div>Building files...</div>

await fabric.render(App)
```

### `renderToString(App)`

Renders a React component tree and returns the final output as a string without writing to stdout.

**Example:**

```tsx [template.tsx]
const Template = () => <div>Generated code</div>

const output = await fabric.renderToString(Template)
console.log(output)
```

### `waitUntilExit()`

Waits until the rendered app exits. Resolves when the component unmounts and emits the `lifecycle:end` event.


**Example:**

```tsx [app.tsx]
await fabric.render(App)
await fabric.waitUntilExit() // Wait for app to finish
console.log('App completed')
```

## Use Cases

### CLI Progress UI

Build interactive command-line interfaces with React components:

```tsx [progress.tsx]
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'
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

```tsx [run.tsx]
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

## See Also

- [createFabric](/core/create-fabric/) - Fabric API reference
- [Events](/core/events/) - Lifecycle events
- [Creating Plugins](/guide/creating-plugins/) - Build custom plugins
