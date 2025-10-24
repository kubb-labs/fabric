<div align="center">
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

Below is a minimal example showing how `createApp` works together with plugins and parsers via `app.use`.

```ts
import { createApp } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser, createParser } from '@kubb/fabric-core/parsers'

const app = createApp()

app.use(fsPlugin, {
  dryRun: false,
  onBeforeWrite: (path, data) => {
    console.log('About to write:', path)
  },
  clean: { path: './generated' },
})

app.use(typescriptParser)

await app.addFile({
  baseName: 'index.ts',
  path: './generated/index.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true },
  ],
})

await app.write()

```

# API Reference

## Core
### `createApp(options?): App`
Returns an app instance with:
- `app.use(pluginOrParser, ...options) => App` — register plugins and parsers.
- `app.addFile(...files)` — queue in-memory files to generate.
- `app.files` — getter with all queued files.
- `app.context` — internal context holding events, options, FileManager, installed plugins/parsers.

### `defineApp(instance?): () => App`
Factory to create your own `createApp` with an optional bootstrap `instance(app)` called on creation.

### App events (emitted by the core during processing)
  - `start`
  - `end`
  - `render { app }`
  - `process:start { files }`
  - `file:start { file, index, total }`
  - `process:progress { file, source, processed, percentage, total }`
  - `file:end { file, index, total }`
  - `process:end { files }`

## Plugins
#### `fsPlugin`
Writes files to disk on `process:progress`, supports dry runs and cleaning an output folder before writing.

```
import { fsPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type                                                                 | Default | Description                                                           |
|---|----------------------------------------------------------------------|---|-----------------------------------------------------------------------|
| dryRun | `boolean`                                                            | `false` | If true, do not write files to disk.               |
| onBeforeWrite | `(path: string, data: string \| undefined) => void \| Promise<void>` | — | Called right before each file write on `process:progress`.            |
| clean | `{ path: string }`                                                   | — | If provided, removes the directory at `path` before writing any files. |

Injected `app.write` options (via `fsPlugin`):

| Option | Type                             | Default | Description |
|---|----------------------------------|---|---|
| extension | `Record<Extname, Extname \| ''>` | — | Maps input file extensions to output extensions. When set, the matching parser (by extNames) is used. |

#### `barrelPlugin`
Generates `index.ts` barrel files per folder at `process:end`. `writeEntry` creates a single entry barrel at `root`.

```
import { barrelPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type                                       | Default | Description |
|---|--------------------------------------------|---|---|
| root | `string`                                   | — | Root directory to generate barrel files for. |
| mode | `'all' \| 'named' \| 'propagate' \| false` | — | Controls how exports are generated: all exports, only named exports, propagate (skip barrels), or disabled. |
| dryRun | `boolean`                                  | `false` | If true, computes barrels but skips writing. |

Injected `app.writeEntry` parameters (via `barrelPlugin`):

| Param | Type                                       | Description |
|---|--------------------------------------------|---|
| root | `string`                                   | Root directory where the entry `index.ts` should be created. |
| mode | `'all' \| 'named' \| 'propagate' \| false` | Controls which export style to use for the entry barrel. |

#### `progressPlugin`
Shows a CLI progress bar by listening to core events.

```
import { progressPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type | Default | Description                                                                             |
|---|---|---|-----------------------------------------------------------------------------------------|
| — | — | — | This plugin has no options, it displays a CLI progress bar by listening to core events. |


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

#### `createPlugin`

Factory to declare a plugin that can be registered via `app.use`.

| Field | Required | Description                                                                                                               |
|---|---|---------------------------------------------------------------------------------------------------------------------------|
| `name` | Yes | String identifier of your plugin.                                                                                         |
| `install(app, options)` | Yes | Called when the plugin is registered. You can subscribe to core events and perform side effects here.                     |
| `inject?(app, options)` | No | Return synchronously the runtime methods/properties to merge into `app` (e.g. `write`, `render`). This must not be async. |

Example:

```ts
import { createApp } from '@kubb/fabric-core'
import { createPlugin } from '@kubb/fabric-core/plugins'

const helloPlugin = createPlugin<{ name?: string }, { sayHello: (msg?: string) => void }>({
  name: 'helloPlugin',
  install(app, options) {
    app.context.events.on('start', () => {
      console.log('App started')
    })
  },
  inject(app, options) {
    return {
      sayHello(msg = options?.name ?? 'world') {
        console.log(`Hello ${msg}!`)
      },
    }
  },
})

const app = createApp()
await app.use(helloPlugin, { name: 'Fabric' })
app.sayHello() // -> Hello Fabric!
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

Fallback parser used when no extension mapping is provided to `app.write`.

```
import { defaultParser } @kubb/fabric-core/parsers`
```

| Option | Type | Default | Description                                                              |
|---|---|---|--------------------------------------------------------------------------|
| file | `KubbFile.File` | -| File that will be used to be parsed.                                                        |

#### `createParser`
Factory to declare a parser that can be registered via `app.use` and selected by `extNames` during `app.write`.

| Field | Required | Description                                                                                                     |
|---|---|-----------------------------------------------------------------------------------------------------------------|
| `name` | Yes | String identifier of your parser.                                                                               |
| `extNames` | Yes | List of file extensions this parser can handle (e.g. ['.ts']). Use `undefined` for the default parser fallback. |
| `install(app, options)` | No | Optional setup when the parser is registered (subscribe to events, set state, etc.).                            |
| `parse(file, { extname })` | Yes | Must return the final string that will be written for the given file.                                           |

Example:

```ts
import { createApp } from '@kubb/fabric-core'
import { createParser } from '@kubb/fabric-core/parsers'

const vueParser = createParser<{ banner?: string }>({
  name: 'vueParser',
  extNames: ['.vue'],
  async install(app, options) {
    // Optional setup
  },
  async parse(file, { extname }) {
    const banner = file.options?.banner ?? ''
    const sources = file.sources.map(s => s.value).join('\n')
    return `${banner}\n${sources}`
  },
})

const app = createApp()
app.use(vueParser)
app.use(fsPlugin); // make it possible to write to the filesystem

app.write({ extension: { '.vue': '.ts' } })
```

> [!NOTE]
> - `app.use` accepts both plugins and parsers. The `fsPlugin` handles I/O and adds `app.write`. Parsers decide how files are converted to strings for specific extensions.
> - When extension mapping is provided to `app.write`, Fabric picks a parser whose `extNames` include the file’s extension. Otherwise, the default parser is used.

# Supporting Kubb

Kubb uses an MIT-licensed open source project with its ongoing development made possible entirely by the support of Sponsors. If you would like to become a sponsor, please consider:

- [Become a Sponsor on GitHub](https://github.com/sponsors/stijnvanhulle)

<p align="center">
  <a href="https://github.com/sponsors/stijnvanhulle">
    <img src="https://raw.githubusercontent.com/stijnvanhulle/sponsors/main/sponsors.svg" alt="My sponsors" />
  </a>
</p>

## Contributors [![Contributors][contributors-src]][contributors-href]

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Star History

<a href="https://star-history.com/#kubb-labs/fabric&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kubb-labs/fabric&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kubb-labs/fabric&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=kubb-labs/fabric&type=Date" />
  </picture>
</a>


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
