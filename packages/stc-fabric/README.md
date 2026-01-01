# String Template Components (stc)

A signal-based component model for code generation without React dependency, inspired by the [Alloy framework](https://alloy-framework.github.io/alloy/) and Vue.js composable patterns.

## Overview

The stc module provides a lightweight, declarative way to generate code using template strings and composable components. Unlike React-based approaches, stc components are pure TypeScript functions that return strings synchronously, making them perfect for code generation scenarios.

## Key Features

- 🎯 **No React dependency** — Pure TypeScript/JavaScript components for code generation
- 🔄 **Signal-based reactivity** — Use `ref()` for reactive values (Vue-style)
- 🎨 **Context support** — Dependency injection via `provide`/`inject` (Vue 3) or `useContext` (React-style)
- 📝 **Template literals** — Natural code generation with tagged templates
- 🔗 **Reference tracking** — Track named entities across components
- ⚡ **Synchronous** — No async/await needed, just like Alloy framework

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

### 3. Reactive Refs (Vue Style)

Use `ref()` for reactive values:

```typescript
import { ref, stc, code } from '@kubb/stc-fabric'

const counter = ref(0)

function Component() {
  counter.value += 1
  return code`const count = ${counter.value};`
}

const MyComponent = stc(Component)
const result1 = MyComponent({}) // => 'const count = 1;'
const result2 = MyComponent({}) // => 'const count = 2;'
```

### 4. References

Track named entities for dependency management:

```typescript
import { createReference, getReference, stc, code } from '@kubb/stc-fabric'

const myVar = createReference('myVariable', 'const myVariable = 42')

function Component() {
  const ref = getReference('myVariable')
  return code`// Reference: ${ref?.name}`
}
```

## Integration with Fabric

```typescript
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { stc, code, provide, createContext } from '@kubb/stc-fabric'

const ConfigContext = createContext({ prefix: 'Generated' })

function CodeGenerator(props: { className: string }) {
  const config = useContext(ConfigContext)
  return code`
export class ${config.prefix}${props.className} {
  constructor() {}
}
  `
}

const Generator = stc(CodeGenerator)

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(typescriptParser)

provide(ConfigContext, { prefix: 'Custom' })
const generatedCode = Generator({ className: 'MyClass' })

await fabric.addFile({
  baseName: 'generated.ts',
  path: './output/generated.ts',
  sources: [{ value: generatedCode, isExportable: false }],
})

await fabric.write()
```

## API Reference

### Component Creation

| Export | Type | Description |
|---|---|---|
| `stc<TProps>(component)` | Function | Wraps a component function to create a string template component |
| `code` / `template` | Template tag | Tagged template literal for code generation |

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

### Reactive Values

| Export | Type | Description |
|---|---|---|
| `ref<T>(initialValue)` | Function | Creates a reactive reference (Vue-style) |
| `createSignal<T>(initialValue)` | Function | Alias for `ref()` |

### References

| Export | Type | Description |
|---|---|---|
| `createReference<T>(name, value)` | Function | Creates a named reference for dependency tracking |
| `getReference<T>(name)` | Function | Retrieves a reference by name |
| `clearReferences()` | Function | Clears all references (useful for testing) |

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

## Comparison: Vue Style vs React Style

**Vue 3 Style (Recommended):**
```typescript
import { provide, inject, ref, stc, code } from '@kubb/stc-fabric'

const ThemeKey = Symbol('theme')
const count = ref(0)

provide(ThemeKey, { color: 'blue' })

function Component() {
  const theme = inject(ThemeKey, { color: 'default' })
  count.value++
  return code`const count = ${count.value};`
}
```

**React Style (Compatible):**
```typescript
import { createContext, useContext, createSignal, provide, stc, code } from '@kubb/stc-fabric'

const ThemeContext = createContext({ color: 'blue' })
const count = createSignal(0)

provide(ThemeContext, { color: 'green' })

function Component() {
  const theme = useContext(ThemeContext)
  count.value++
  return code`const count = ${count.value};`
}
```

Both styles work! Use whichever feels more natural for your team.

## License

MIT
