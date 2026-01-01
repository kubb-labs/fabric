# String Template Components (stc)

A signal-based component model for code generation without React dependency, inspired by the [Alloy framework](https://alloy-framework.github.io/alloy/) and Vue.js composable patterns.

## Overview

The stc module provides a lightweight, declarative way to generate code using template strings and composable components. Unlike React-based approaches, stc components are pure TypeScript functions that return strings synchronously, making them perfect for code generation scenarios.

## Key Features

- 🎯 **No React dependency** — Pure TypeScript/JavaScript components for code generation
- 🎨 **Context support** — Dependency injection via `provide`/`inject` (Vue 3) or `useContext` (React-style)
- 📝 **Template literals** — Natural code generation with tagged templates
- ⚡ **Synchronous** — No async/await needed, just like Alloy framework
- 🧩 **Rich component library** — Pre-built components for common code patterns (Function, Type, Const, etc.)
- 🚀 **Context-based file collection** — Register files without tree walking

## Installation

```bash
npm install @kubb/stc-fabric
```

## Quick Start

```typescript
import { stc, code } from '@kubb/stc-fabric'

function HelloWorld(props: { name: string }) {
  return code`
    const greeting = "Hello, ${props.name}!";
  `
}

const HelloWorldStc = stc(HelloWorld)
const result = HelloWorldStc({ name: 'World' })
// => 'const greeting = "Hello, World!";'
```

## Core Concepts

### 1. Components

Components are synchronous functions that accept props and return strings:

```typescript
function ClassGenerator(props: { name: string; methods: string[] }) {
  const methodsCode = props.methods
    .map(method => `  ${method}() {\n    // TODO: implement\n  }`)
    .join('\n\n')

  return code`
export class ${props.name} {
${methodsCode}
}
  `
}

const Generator = stc(ClassGenerator)
const result = Generator({ name: 'User', methods: ['getName', 'setName'] })
```

### 2. Context (Vue 3 Style)

Use `provide`/`inject` for dependency injection:

```typescript
import { provide, inject, stc, code } from '@kubb/stc-fabric'

const ConfigKey = Symbol('config')

// Provide a value
provide(ConfigKey, { prefix: 'app' })

function Component(props: { name: string }) {
  const config = inject(ConfigKey, { prefix: 'default' })
  return code`const ${config.prefix}_${props.name} = true;`
}

const MyComponent = stc(Component)
const result = MyComponent({ name: 'flag' })
// => 'const app_flag = true;'
```

### 2b. Context (React Style)

Or use React-compatible `createContext`/`useContext`:

```typescript
import { createContext, useContext, provide, stc, code } from '@kubb/stc-fabric'

const ConfigContext = createContext({ prefix: 'generated' })

// Override with provide
provide(ConfigContext, { prefix: 'custom' })

function Component(props: { name: string }) {
  const config = useContext(ConfigContext)
  return code`const ${config.prefix}_${props.name} = true;`
}
```

## Integration with Fabric

### Using createStcFabric

The recommended way to use stc with Fabric is via `createStcFabric`, which pre-configures the fabric instance:

```typescript
import { createStcFabric, File, stc, code } from '@kubb/stc-fabric'

function CodeGenerator(props: { className: string }) {
  // Register files via File component - uses context internally
  File({
    baseName: 'generated.ts',
    path: './output/generated.ts',
  })

  return code`
export class ${props.className} {
  constructor() {}
}
  `
}

const Generator = stc(CodeGenerator)

const fabric = createStcFabric()
await fabric.render(Generator({ className: 'MyClass' }))

// Files are automatically collected via context
const files = fabric.fileManager.files
// write files to disk
await fabric.write()
```

### File Collection via Context

Components can register files using the `File` component, which uses context to communicate with the FileManager:

```typescript
import { File, stc, code } from '@kubb/stc-fabric'

function MultiFileGenerator() {
  // Each File() call registers a file via context
  File({
    baseName: 'types.ts',
    path: './output/types.ts',
  })

  File({
    baseName: 'index.ts',
    path: './output/index.ts',
  })

  return code`
// Type definitions
export type User = {
  id: number
  name: string
}
  `
}
```

This approach eliminates the need to manually loop over children or walk a DOM tree - files register themselves!

## API Reference

### Component Creation

| Export | Type | Description |
|---|---|---|
| `stc<TProps>(component)` | Function | Wraps a component function to create a string template component |
| `code` / `template` | Template tag | Tagged template literal for code generation |

### Built-in Components

| Component | Description |
|---|---|
| `Function` | Generate function declarations with JSDoc, generics, params, return types |
| `Function.Arrow` | Generate arrow function expressions |
| `Type` | Generate TypeScript type aliases |
| `Const` | Generate const declarations with optional typing |
| `Indent` | Indent content by specified spaces |
| `File` | Register files via context for file collection |
| `App` | Application wrapper component |
| `Root` | Root component with error handling |

### Context (Vue 3 Style)

| Export | Type | Description |
|---|---|---|
| `provide<T>(key, value)` | Function | Provides a value to descendant components (Vue 3 style) |
| `inject<T>(key, defaultValue?)` | Function | Injects a value provided by an ancestor (Vue 3 style) |
| `unprovide(key)` | Function | Removes the most recent provided value (for cleanup) |

### Context (React Style)

| Export | Type | Description |
|---|---|---|
| `createContext<T>(defaultValue)` | Function | Creates a context key with default value (returns symbol) |
| `useContext<T>(key, defaultValue?)` | Function | React-style alias for `inject()` |

### Composables (Hooks)

Composables provide access to framework functionality using the familiar `use` prefix:

| Export | Type | Description |
|---|---|---|
| `useApp<TMeta>()` | Function | Returns the current App context with `meta` and `exit` function |
| `useFile()` | Function | Returns the FileCollector for registering files programmatically |
| `useLifecycle()` | Function | Returns lifecycle helpers like `exit()` to stop generation |

**Example:**
```typescript
import { useApp, useLifecycle, stc, code } from '@kubb/stc-fabric'

function MyComponent() {
  const { meta } = useApp<{ version: string }>()
  const { exit } = useLifecycle()
  
  if (!meta.version) {
    exit() // Stop generation early
  }
  
  return code`// Version: ${meta.version}`
}
```

## Examples

### TypeScript Interface Generator

```typescript
import { stc, code } from '@kubb/stc-fabric'

function InterfaceGenerator(props: { 
  name: string
  fields: Array<{ name: string; type: string }> 
}) {
  const fieldsCode = props.fields
    .map(field => `  ${field.name}: ${field.type};`)
    .join('\n')

  return code`
interface ${props.name} {
${fieldsCode}
}
  `.trim()
}

const Generator = stc(InterfaceGenerator)
const result = Generator({
  name: 'User',
  fields: [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
  ],
})
```

### Component Composition

```typescript
import { stc, code } from '@kubb/stc-fabric'

function Header() {
  return code`// Auto-generated file`
}

function Body(props: { content: string }) {
  return code`export const data = "${props.content}";`
}

const HeaderStc = stc(Header)
const BodyStc = stc(Body)

const header = HeaderStc({})
const body = BodyStc({ content: 'test' })

const final = code`
${header}

${body}
`.trim()
```

### Using Built-in Components

The package includes pre-built components for common code generation patterns:

```typescript
import { Function, Type, Const, code } from '@kubb/stc-fabric'

// Generate a TypeScript type
const userType = Type({
  name: 'User',
  export: true,
  JSDoc: { comments: ['User entity'] },
  children: '{ id: number; name: string }'
})

// Generate a const declaration
const config = Const({
  name: 'config',
  export: true,
  type: 'Config',
  children: '{ apiUrl: "https://api.example.com" }',
  asConst: true
})

// Generate a function
const getUserFn = Function({
  name: 'getUser',
  export: true,
  async: true,
  params: 'id: number',
  returnType: 'User',
  JSDoc: { comments: ['Fetch user by ID'] },
  children: code`
    const response = await fetch(\`/api/users/\${id}\`)
    return response.json()
  `
})

// Generate an arrow function
const mapUserFn = Function.Arrow({
  name: 'mapUser',
  export: true,
  params: 'user: User',
  returnType: 'UserDTO',
  singleLine: true,
  children: '({ id: user.id, name: user.name })'
})

// Combine them
const result = code`
${userType}

${config}

${getUserFn}

${mapUserFn}
`.trim()
```


## Comparison: Vue Style vs React Style

**Vue 3 Style (Recommended):**
```typescript
import { provide, inject, stc, code } from '@kubb/stc-fabric'

const ThemeKey = Symbol('theme')

provide(ThemeKey, { color: 'blue' })

function Component() {
  const theme = inject(ThemeKey, { color: 'default' })
  return code`const color = "${theme.color}";`
}
```

**React Style (Compatible):**
```typescript
import { createContext, useContext, provide, stc, code } from '@kubb/stc-fabric'

const ThemeContext = createContext({ color: 'blue' })

provide(ThemeContext, { color: 'green' })

function Component() {
  const theme = useContext(ThemeContext)
  return code`const color = "${theme.color}";`
}
```

Both styles work! Use whichever feels more natural for your team.

## License

MIT
