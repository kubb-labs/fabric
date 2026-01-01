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
- 🔗 Automatic import management — RefKey system inspired by Alloy automatically manages imports across files.
- 🏗️ Rich component library — Interface, Class, Enum, Function, and more for TypeScript code generation.
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

### `createRefKey<T>(name?): RefKey<T>`
Creates a reference key for automatic import management, inspired by [Alloy's refkey system](https://github.com/alloy-framework/alloy). RefKeys enable you to reference code symbols across files without manually managing imports.

**Returns a RefKey with:**
- `id: string` — Unique identifier for this reference
- `name?: string` — The symbol name being referenced
- `path?: string` — The file path where the symbol is defined
- `isTypeOnly?: boolean` — Whether this is a type-only reference
- `resolve(name, path, options?)` — Mark this refkey as resolved with a symbol name and file path

**Example:**
```ts
import { createFabric, createRefKey } from '@kubb/fabric-core'
import { refKeyPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(refKeyPlugin)

const fooRef = createRefKey()

// Define the symbol
fabric.addFile({
  path: './file1.ts',
  sources: [{
    name: 'foo',
    value: 'export const foo = "hello"',
    refkey: fooRef.resolve('foo', './file1.ts')
  }]
})

// Use it elsewhere - imports are auto-added
fabric.addFile({
  path: './file2.ts',
  sources: [{
    value: `console.log(foo)` // 'foo' will be imported automatically
  }]
})
```


### Events (emitted by the core during processing)

Fabric emits events throughout its lifecycle that plugins and custom code can listen to. These events provide hooks for monitoring progress, transforming files, and performing custom operations.

#### Lifecycle Events
- **`lifecycle:start`** — Emitted when Fabric begins execution
- **`lifecycle:end`** — Emitted when Fabric completes execution
- **`lifecycle:render { fabric }`** — Emitted when rendering starts (with reactPlugin)

#### File Management Events
- **`files:added { files }`** — Emitted when files are added to the FileManager cache
- **`file:resolve:path { file }`** — Emitted during file path resolution (allows modification)
- **`file:resolve:name { file }`** — Emitted during file name resolution (allows modification)

#### File Writing Events
- **`files:writing:start { files }`** — Emitted before writing files to disk
- **`files:writing:end { files }`** — Emitted after files are written to disk

#### File Processing Events
- **`files:processing:start { files }`** — Emitted before processing begins
- **`file:processing:start { file, index, total }`** — Emitted when each file starts processing
- **`file:processing:end { file, index, total }`** — Emitted when each file finishes processing
- **`file:processing:update { file, source, processed, percentage, total }`** — Emitted with progress updates
- **`files:processing:end { files }`** — Emitted when all processing completes

#### Listening to Events

You can listen to events using the Fabric context:

```ts
const fabric = createFabric()

fabric.context.on('lifecycle:start', async () => {
  console.log('Starting Fabric...')
})

fabric.context.on('file:processing:update', async ({ processed, total, percentage }) => {
  console.log(`Progress: ${percentage.toFixed(1)}% (${processed}/${total})`)
})

fabric.context.on('lifecycle:end', async () => {
  console.log('Fabric completed!')
})
```


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

Injected `fabric.write` options (via `fsPlugin`):

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

Injected `fabric.writeEntry` parameters (via `barrelPlugin`):

> [!IMPORTANT]
> `fabric.writeEntry` should be called before `fabric.write`


| Param | Type                                       | Description |
|---|--------------------------------------------|---|
| root | `string`                                   | Root directory where the entry `index.ts` should be created. |
| mode | `'all' \| 'named' \| 'propagate' \| false` | Controls which export style to use for the entry barrel. |

#### `loggerPlugin`
Streams Fabric lifecycle activity with beautiful @clack/prompts output, progress bars, and websocket messages that you can consume from custom tooling.

```
import { loggerPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type | Default | Description |
|---|---|---|---|
| progress | `boolean` | `true` | Enable/disable the integrated CLI progress bar. |
| websocket | `boolean \| { host?: string; port?: number }` | `true` | Toggle or configure the websocket server that broadcasts Fabric events for future GUIs. |

By default the plugin displays a beautiful progress bar using @clack/prompts, starts a websocket server on an ephemeral port, and announces the URL. Every key lifecycle hook (`start`, `process:*`, `file:*`, `write:*`, `end`) is logged with colored output and symbols, animated in the progress bar, and broadcast to connected clients—perfect for building dashboards on top of Fabric.


#### `refKeyPlugin`
Enables automatic import management using RefKeys, inspired by [Alloy's refkey system](https://github.com/alloy-framework/alloy). When you create a refkey and attach it to an exported symbol, the plugin automatically adds import statements when that symbol is referenced in other files.

```
import { refKeyPlugin } from '@kubb/fabric-core/plugins'
```

| Option | Type | Default | Description |
|---|---|---|---|
| enabled | `boolean` | `true` | Enable/disable automatic import resolution based on refkeys. |

**How it works:**
1. Create a refkey using `createRefKey()`
2. Attach it to a source with `.resolve(symbolName, filePath, options)`
3. Use the refkey in another file - imports are automatically added

**Example:**

```ts
import { createFabric, createRefKey } from '@kubb/fabric-core'
import { refKeyPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(refKeyPlugin)

// Create a refkey
const fooRef = createRefKey()

// Define symbol with refkey
fabric.addFile({
  path: './file1.ts',
  sources: [{
    name: 'foo',
    value: 'export const foo = "bar"',
    refkey: fooRef.resolve('foo', './file1.ts')
  }]
})

// Use refkey in another file - import will be auto-added!
fabric.addFile({
  path: './file2.ts',
  sources: [{
    value: `console.log(foo)` // import { foo } from './file1' is added automatically
  }]
})
```


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

## JSX Components

Fabric provides a rich set of React components for declarative TypeScript code generation, inspired by Alloy's approach.

### `<Interface />`
Generates TypeScript interface declarations with support for generics, extends, and JSDoc.

```tsx
<Interface name="User" export generics="T" extends="BaseEntity">
  id: T{'\n'}
  name: string{'\n'}
  email?: string
</Interface>
// Outputs:
// export interface User<T> extends BaseEntity {
//   id: T
//   name: string
//   email?: string
// }
```

### `<Class />`
Generates TypeScript class declarations with support for abstract classes, generics, extends, implements, and JSDoc.

```tsx
<Class name="UserService" export abstract implements={['IService', 'ILogger']}>
  abstract getUser(id: number): Promise{'<'}User{'>'}
</Class>
// Outputs:
// export abstract class UserService implements IService, ILogger {
//   abstract getUser(id: number): Promise<User>
// }
```

### `<Enum />`
Generates TypeScript enum declarations with support for const enums and JSDoc.

```tsx
<Enum name="Status" export const>
  Pending = "pending",{'\n'}
  Active = "active",{'\n'}
  Completed = "completed"
</Enum>
// Outputs:
// export const enum Status {
//   Pending = "pending",
//   Active = "active",
//   Completed = "completed"
// }
```

### `<VarDeclaration />`
Generates variable declarations with support for const/let/var, type annotations, and JSDoc.

```tsx
<VarDeclaration name="config" type="Config" export kind="const">
  {{ port: 3000, host: 'localhost' }}
</VarDeclaration>
// Outputs:
// export const config: Config = { port: 3000, host: 'localhost' }
```

All components support the `refkey` prop for automatic import management when used with the `refKeyPlugin`.

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
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.stijnvanhulle.be"><img src="https://avatars.githubusercontent.com/u/5904681?v=4?s=100" width="100px;" alt="Stijn Van Hulle"/><br /><sub><b>Stijn Van Hulle</b></sub></a><br /><a href="https://github.com/kubb-labs/fabric/commits?author=stijnvanhulle" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/blackravenx"><img src="https://avatars.githubusercontent.com/u/70589675?v=4?s=100" width="100px;" alt="Max Shy"/><br /><sub><b>Max Shy</b></sub></a><br /><a href="https://github.com/kubb-labs/fabric/commits?author=blackravenx" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

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
