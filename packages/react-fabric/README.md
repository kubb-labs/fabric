<div align="center">
<h1>React Fabric</h1>

  <a href="https://kubb.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://raw.githubusercontent.com/kubb-labs/fabric/main/assets/logo.png" alt="Kubb fabric logo">
  </a>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Coverage][coverage-src]][coverage-href]
[![License][license-src]][license-href]
[![Sponsors][sponsors-src]][sponsors-href]

<h4>
    <a href="https://kubb.dev/" target="_blank">Documentation</a>
    <span> · </span>
      <a href="https://github.com/kubb-labs/fabric/issues/" target="_blank">Report Bug</a>
    <span> · </span>
      <a href="https://github.com/kubb-labs/fabric/issues/" target="_blank">Request Feature</a>
</h4>
</div>
<br />

Kubb Fabric is a language-agnostic toolkit for generating code and files using JSX and TypeScript.
It offers a lightweight layer for file generation while orchestrating the overall process of creating and managing files.

> [!WARNING]
> Fabric is under active development. Until a stable 1.0 release, minor versions may occasionally include breaking changes. Please check release notes and PR titles for breaking changes.


# Features

- 🎨 Declarative file generation — Create files effortlessly using JSX or JavaScript syntax.
- 📦 Cross-runtime support — Works seamlessly with Node.js and Bun.
- 🧩 Built-in debugging utilities — Simplify development and inspect generation flows with ease.
- ⚡ Fast and lightweight — Minimal overhead, maximum performance.

## Write a TypeScript file

Below is a minimal example showing how `createFabric` works together with plugins and parsers via `fabric.use`.

```ts
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, {
  dryRun: false,
  onBeforeWrite: (path, data) => {
    console.log('About to write:', path)
  },
  clean: { path: './generated' },
})

fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'index.ts',
  path: './generated/index.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
```

Creates a file `generated/index.ts` with the following content:
```ts
export const x = 1
```

# API Reference

## Core
### `createFabric(options?): Fabric`
Returns a Fabric instance with:
- `fabric.use(pluginOrParser, ...options) => Fabric` — register plugins and parsers.
- `fabric.addFile(...files)` — queue in-memory files to generate.
- `fabric.files` — getter with all queued files.
- `fabric.context` — internal context holding events, options, FileManager, installed plugins/parsers.

### Events (emitted by the core during processing)
- `lifecycle:start`
- `lifecycle:end`
- `lifecycle:render { fabric }`
- `files:added { files }`
- `files:writing:start { files }`
- `files:writing:end { files }`
- `file:processing:start { file, index, total }`
- `file:processing:end { file, index, total }`
- `files:processing:start { files }`
- `files:processing:update { file, source, processed, percentage, total }`
- `files:processing:end { files }`


## Plugins
#### `fsPlugin`
Writes files to disk on `files:processing:update`, supports dry runs and cleaning an output folder before writing.

```
import { fsPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type                                                                 | Default | Description                                                           |
|---|----------------------------------------------------------------------|---|-----------------------------------------------------------------------|
| dryRun | `boolean`                                                            | `false` | If true, do not write files to disk.               |
| onBeforeWrite | `(path: string, data: string \| undefined) => void \| Promise<void>` | — | Called right before each file write on `files:processing:update`.            |
| clean | `{ path: string }`                                                   | — | If provided, removes the directory at `path` before writing any files. |

Injected `fabric.write` options (via `fsPlugin`):

| Option | Type                             | Default | Description |
|---|----------------------------------|---|---|
| extension | `Record<Extname, Extname \| ''>` | — | Maps input file extensions to output extensions. When set, the matching parser (by extNames) is used. |

#### `barrelPlugin`
Generates `index.ts` barrel files per folder when `files:writing:start` is triggered. `writeEntry` creates a single entry barrel at `root`.

```
import { barrelPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type                                       | Default | Description |
|---|--------------------------------------------|---|---|
| root | `string`                                   | — | Root directory to generate barrel files for. |
| mode | `'all' \| 'named' \| 'propagate' \| false` | — | Controls how exports are generated: all exports, only named exports, propagate (skip barrels), or disabled. |
| dryRun | `boolean`                                  | `false` | If true, computes barrels but skips writing. |

Injected `fabric.writeEntry` parameters (via `barrelPlugin`):

| Param | Type                                       | Description |
|---|--------------------------------------------|---|
| root | `string`                                   | Root directory where the entry `index.ts` should be created. |
| mode | `'all' \| 'named' \| 'propagate' \| false` | Controls which export style to use for the entry barrel. |

#### `loggerPlugin`
Streams Fabric lifecycle activity as colourful consola logs, optional progress bars, and websocket messages that you can consume from custom tooling.

```
import { loggerPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type | Default | Description |
|---|---|---|---|
| level | `import('consola').LogLevel` | — | Optional explicit log level passed to `createConsola`. |
| progress | `boolean` | `true` | Enable/disable the integrated CLI progress bar. |
| websocket | `boolean \| { host?: string; port?: number }` | `true` | Toggle or configure the websocket server that broadcasts Fabric events for future GUIs. |

By default the plugin displays a progress bar, starts a websocket server on an ephemeral port, and announces the URL. Every key lifecycle hook (`start`, `process:*`, `file:*`, `write:*`, `end`) is logged with a `Fabric` tag, animated in the progress bar, and broadcast to connected clients—perfect for building dashboards on top of Fabric.


#### `graphPlugin`
Shows a graph of all files

```
import { graphPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type      | Default | Description                                   |
|--------|-----------|---------|-----------------------------------------------|
| root   | `string`  |         | Root directory where to start searching from. |
| open   | `boolean` | false   | Open a webpage with the generated graph       |


#### `reactPlugin`
Enables rendering React components to the terminal or to a string. Useful for CLI UIs and templating.

```
import { reactPlugin } from '@kubb/react-fabric/plugins'
```

| Option | Type | Default | Description |
|---|---|---|---|
| stdout | `NodeJS.WriteStream` | — | Optional output stream used to print the rendered content while the app is running. If set, the output is written progressively. |
| stdin | `NodeJS.ReadStream` | — | Optional input stream for interactive components. |
| stderr | `NodeJS.WriteStream` | — | Optional error output stream. |
| debug | `boolean` | — | When true, logs render/unmount information to the console to aid debugging. |

Injected methods (via `reactPlugin`):

| Method | Signature | Description                                                                                        |
|---|---|----------------------------------------------------------------------------------------------------|
| `render` | `(App: React.ElementType) => Promise<void> \| void` | Render a React component tree to the terminal and emit the core `start` event.                     |
| `renderToString` | `(App: React.ElementType) => Promise<string> \| string` | Render a React component tree and return the final output as a string (without writing to stdout). |
| `waitUntilExit` | `() => Promise<void>` | Wait until the rendered app exits, resolves when unmounted and emits the core `end` event.         |

#### `definePlugin`

Factory to declare a plugin that can be registered via `fabric.use`.

| Field                      | Required | Description                                                                                                                  |
|----------------------------|---|------------------------------------------------------------------------------------------------------------------------------|
| `name`                     | Yes | String identifier of your plugin.                                                                                            |
| `install(fabric, options)` | Yes | Called when the plugin is registered. You can subscribe to core events and perform side effects here.                        |
| `inject?(fabric, options)` | No | Return synchronously the runtime methods/properties to merge into `fabric` (e.g. `write`, `render`). This must not be async. |

Example:

```ts
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'

const helloPlugin = definePlugin<{ name?: string }, { sayHello: (msg?: string) => void }>({
  name: 'helloPlugin',
  install(fabric, options) {
    fabric.context.events.on('lifecycle:start', () => {
      console.log('Fabric started')
    })
  },
  inject(fabric, options) {
    return {
      sayHello(msg = options?.name ?? 'world') {
        console.log(`Hello ${msg}!`)
      },
    }
  },
})

const fabric = createFabric()
await fabric.use(helloPlugin, { name: 'Fabric' })
fabric.sayHello() // -> Hello Fabric!
```

## Parsers
#### `typescriptParser`

Prints TS/JS imports/exports and sources, supports extname mapping for generated import/export paths.

```
import { typescriptParser } from '@kubb/fabric-core/parsers'
```

| Option | Type | Default | Description                                                                                 |
|---|---|---|---------------------------------------------------------------------------------------------|
| file | `KubbFile.File` | -| File that will be used to be parsed.                                                        |
| extname | `string` | `'.ts'` | Extension to use when emitting import/export paths (e.g., rewrite `./file` to `./file.ts`). |

#### `tsxParser`

Delegates to `typescriptParser` with TSX printing settings.

```
import { tsxParser } from '@kubb/fabric-core/parsers'
```

| Option | Type | Default | Description |
|---|---|---|---|
| file | `KubbFile.File` | -| File that will be used to be parsed.                                                        |
| extname | `string` | `'.tsx'` | Extension to use when emitting import/export paths for TSX/JSX files. |

#### `defaultParser`

Fallback parser used when no extension mapping is provided to `fabric.write`.

```
import { defaultParser } @kubb/fabric-core/parsers`
```

| Option | Type | Default | Description                                                              |
|---|---|---|--------------------------------------------------------------------------|
| file | `KubbFile.File` | -| File that will be used to be parsed.                                                        |

#### `defineParser`
Factory to declare a parser that can be registered via `fabric.use` and selected by `extNames` during `fabirc.write`.

| Field                      | Required | Description                                                                                                     |
|----------------------------|---|-----------------------------------------------------------------------------------------------------------------|
| `name`                     | Yes | String identifier of your parser.                                                                               |
| `extNames`                 | Yes | List of file extensions this parser can handle (e.g. ['.ts']). Use `undefined` for the default parser fallback. |
| `install(fabric, options)` | No | Optional setup when the parser is registered (subscribe to events, set state, etc.).                            |
| `parse(file, { extname })` | Yes | Must return the final string that will be written for the given file.                                           |

Example:

```ts
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'

const vueParser = defineParser<{ banner?: string }>({
  name: 'vueParser',
  extNames: ['.vue'],
  async install(fabric, options) {
    // Optional setup
  },
  async parse(file, { extname }) {
    const banner = file.options?.banner ?? ''
    const sources = file.sources.map(s => s.value).join('\n')
    return `${banner}\n${sources}`
  },
})

const fabric = createFabric()
fabric.use(vueParser)
fabric.use(fsPlugin); // make it possible to write to the filesystem

fabric.write({ extension: { '.vue': '.ts' } })
```

> [!NOTE]
> - `fabric.use` accepts both plugins and parsers. The `fsPlugin` handles I/O and adds `fabric.write`. Parsers decide how files are converted to strings for specific extensions.
> - When extension mapping is provided to `fabric.write`, Fabric picks a parser whose `extNames` include the file’s extension. Otherwise, the default parser is used.


<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@kubb/fabric-core?flat&colorA=18181B&colorB=f58517
[npm-version-href]: https://npmjs.com/package/@kubb/fabric-core
[npm-downloads-src]: https://img.shields.io/npm/dm/@kubb/fabric-core?flat&colorA=18181B&colorB=f58517
[npm-downloads-href]: https://npmjs.com/package/@kubb/fabric-core
[license-src]: https://img.shields.io/github/license/kubb-labs/fabric.svg?flat&colorA=18181B&colorB=f58517
[license-href]: https://github.com/kubb-labs/fabric/blob/main/LICENSE
[build-src]: https://img.shields.io/github/actions/workflow/status/kubb-labs/fabric/ci.yaml?style=flat&colorA=18181B&colorB=f58517
[build-href]: https://www.npmjs.com/package/@kubb/fabric-core
[minified-src]: https://img.shields.io/bundlephobia/min/@kubb/fabric-core?style=flat&colorA=18181B&colorB=f58517
[minified-href]: https://www.npmjs.com/package/@kubb/fabric-core
[coverage-src]: https://img.shields.io/codecov/c/github/kubb-labs/fabric?style=flat&colorA=18181B&colorB=f58517
[coverage-href]: https://www.npmjs.com/package/@kubb/fabric-core
[contributors-src]: https://img.shields.io/github/contributors/kubb-labs/fabric?style=flat&colorA=18181B&colorB=f58517&label=%20
[contributors-href]: #contributors-
[sponsors-src]: https://img.shields.io/github/sponsors/stijnvanhulle?style=flat&colorA=18181B&colorB=f58517
[sponsors-href]: https://github.com/sponsors/stijnvanhulle/
