---
layout: doc
title: reactPlugin
outline: deep
---

# `reactPlugin`

The `reactPlugin` uses React and JSX syntax to create files.

## Usage

Create a component that returns `hello from React!` and render it using the `reactPlugin`.

```tsx
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'

const fabric = createFabric()

fabric.use(reactPlugin)

const App = () => {
  return <div>Hello from React!</div>
}

await fabric.render(App)
```

## Options

### `stdout`

Output stream for rendered content. If set, output is written progressively.

|           |                                 |
|----------:|:--------------------------------|
|     Type: | ` NodeJS.WriteStream`                              |
| Required: | `false`                         |

```ts [example.ts]
import { createWriteStream } from 'fs'

fabric.use(reactPlugin, {
  stdout: createWriteStream('./output.txt'),
})
```

### `stdin`

Configure input and error streams for interactive components:

|           |                                 |
|----------:|:--------------------------------|
|     Type: | ` NodeJS.WriteStream`                              |
| Required: | `false`                         |

```ts [example.ts]
fabric.use(reactPlugin, {
  stdin: process.stdin,
})
```

### `stderr`

Configure input and error streams for interactive components:

|           |                                 |
|----------:|:--------------------------------|
|     Type: | ` NodeJS.WriteStream`                              |
| Required: | `false`                         |

```ts [example.ts]
fabric.use(reactPlugin, {
  stderr: process.stderr,
})
```

### `debug`

Enable debug mode to log render lifecycle information:


|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |


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

```tsx
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

## Examples

### CLI Progress UI

Build interactive command-line interfaces that shows a progressbar with React components:

```tsx twoslash
import { createFabric, useEffect, useState } from '@kubb/react-fabric'
import { reactPlugin } from '@kubb/react-fabric/plugins'

const fabric = createFabric()

fabric.use(reactPlugin, { stdout: process.stdout }) // show the output in the terminal

const Progress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 100))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return <>Progress: {progress}%</>
}

await fabric.render(<Progress />)
await fabric.waitUntilExit()
```

### Template Generation

Generate code templates using React components:

```tsx twoslash
import { createFabric} from '@kubb/react-fabric'
import { reactPlugin } from '@kubb/react-fabric/plugins'

const fabric = createFabric()

fabric.use(reactPlugin, { stdout: process.stdout }) // show the output in the terminal

const TypeTemplate = ({ name, fields }: {  name: string; fields: string[] }) => {
  return (
    <>
      export interface {name} {'{'}
      {fields.map(f => (
        <>  {f}: string;</>
      ))}
      {'}'}
    </>
  )
}

await fabric.render(<TypeTemplate name="User" fields={['id', 'name', 'email']} />)
await fabric.waitUntilExit()

```

## See Also

- [createFabric](/core/create-fabric/) - Fabric API reference
- [Events](/core/events/) - Lifecycle events
- [Creating Plugins](/guide/creating-plugins/) - Build custom plugins
