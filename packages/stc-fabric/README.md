# String Template Components (stc)

A signal-based component model for code generation without React dependency, inspired by the [Alloy framework](https://alloy-framework.github.io/alloy/).

## Overview

The stc module provides a lightweight, declarative way to generate code using template strings and composable components. Unlike React-based approaches, stc components are pure TypeScript functions that return strings, making them perfect for code generation scenarios.

## Key Features

- 🎯 **No React dependency** — Pure TypeScript/JavaScript components for code generation
- 🔄 **Signal-based reactivity** — Use signals for reactive values
- 🎨 **Context support** — Dependency injection via context
- 📝 **Template literals** — Natural code generation with tagged templates
- 🔗 **Reference tracking** — Track named entities across components

## Installation

The stc module is available as a standalone package:

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
const result = await HelloWorldStc({ name: 'World' })
// => 'const greeting = "Hello, World!";'
```

## Core Concepts

### 1. Components

Components are functions that accept props and return strings:

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
```

### 2. Context

Use context for dependency injection and configuration:

```typescript
import { createContext, useContext } from '@kubb/stc-fabric'

const ConfigContext = createContext({ 
  prefix: 'generated',
  suffix: 'Impl'
})

function Component(props: { name: string }) {
  const config = useContext(ConfigContext)
  return code`const ${config.prefix}_${props.name} = true;`
}
```

### 3. Signals

Signals provide reactive values that can be read and written:

```typescript
import { createSignal } from '@kubb/stc-fabric'

const counter = createSignal(0)

function Component() {
  counter.value += 1
  return code`const count = ${counter.value};`
}
```

### 4. References

Track named entities for dependency management:

```typescript
import { createReference, getReference } from '@kubb/stc-fabric'

const myVar = createReference('myVariable', 'const myVariable = 42')

function Component() {
  const ref = getReference('myVariable')
  return code`// Reference: ${ref?.name}`
}
```

## Integration with Fabric

stc components work seamlessly with Fabric's file generation system:

```typescript
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { stc, code } from '@kubb/stc-fabric'

function CodeGenerator(props: { className: string }) {
  return code`
export class ${props.className} {
  constructor() {
    // Generated class
  }
}
  `
}

const Generator = stc(CodeGenerator)

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(typescriptParser)

const generatedCode = await Generator({ className: 'MyClass' })

await fabric.addFile({
  baseName: 'generated.ts',
  path: './output/generated.ts',
  sources: [{ value: generatedCode, isExportable: false }],
})

await fabric.write()
```

## API Reference

### `stc<TProps>(component)`

Wraps a component function to create a string template component.

**Parameters:**
- `component`: A function that accepts props and returns a string or Promise<string>

**Returns:** A wrapped component function

### `code` / `template`

Tagged template literal for code generation.

```typescript
const result = code`const x = ${value};`
```

### `createContext<T>(defaultValue)`

Creates a context for dependency injection.

**Parameters:**
- `defaultValue`: The default value for the context

**Returns:** A context object with `Provider` and `defaultValue`

### `useContext<T>(context)`

Retrieves the current value from a context.

**Parameters:**
- `context`: The context to read from

**Returns:** The current context value

### `createSignal<T>(initialValue)`

Creates a reactive signal value.

**Parameters:**
- `initialValue`: The initial value of the signal

**Returns:** A signal object with `value` getter/setter

### `createReference<T>(name, value)`

Creates a named reference for dependency tracking.

**Parameters:**
- `name`: The name of the reference
- `value`: The value to store

**Returns:** A reference object with `name` and `value`

### `getReference<T>(name)`

Retrieves a reference by name.

**Parameters:**
- `name`: The name of the reference to retrieve

**Returns:** The reference object or undefined

### `clearReferences()`

Clears all references (useful for testing).

## Examples

### TypeScript Interface Generator

```typescript
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
const result = await Generator({
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
function Header() {
  return code`// Auto-generated file`
}

function Body(props: { content: string }) {
  return code`export const data = "${props.content}";`
}

const HeaderStc = stc(Header)
const BodyStc = stc(Body)

const header = await HeaderStc({})
const body = await BodyStc({ content: 'test' })

const final = code`
${header}

${body}
`.trim()
```

## License

MIT
