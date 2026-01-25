---
layout: doc
title: Getting Started with Fabric
outline: deep
---

# Tutorial: Getting Started with Fabric

Learn Fabric basics by creating your first file generator.

## What You'll Build

A simple generator that creates a JavaScript file with a greeting function.

> [!NOTE]
> Complete the [Installation](/getting-started/installation) guide before starting this tutorial.

## Step 1: Create Your Generator

Create a file named `generate.js` with this code:

```js twoslash
import { createFabric } from '@kubb/fabric-core'

// This is the code we want to generate
const greetingFunction = `export function greet(name) {
  return \`Hello, \${name}! Welcome to Fabric.\`
}`

// Create a Fabric instance
const fabric = createFabric()

// Add a file to generate
await fabric.addFile({
  baseName: 'greeting.js',
  path: './output/greeting.js',
  sources: [{ value: greetingFunction }],
})

// Write the file to disk
await fabric.write()

console.log('✓ File generated successfully!')
```

## Step 2: Run Your Generator

Execute the generator:

::: code-group

```bash [bun]
bun generate.js
```

```bash [node]
node generate.js
```

:::

## Step 3: Check the Output

Open `output/greeting.js`:

```js [output/greeting.js]
export function greet(name) {
  return `Hello, ${name}! Welcome to Fabric.`
}
```

## Understanding the Code

**createFabric()** - Creates a new generator instance

**addFile()** - Queues a file for generation:
- `baseName` - File name
- `path` - Where to save it
- `sources` - What code to generate

**write()** - Writes all queued files to disk

## Next Steps

- **[Using Components](/tutorials/using-components)** - Declarative component-based approach
- **[Quick Start Guide](/getting-started/quick-start)** - Plugins and advanced features
- **[Core API](/core/create-fabric)** - Complete API reference
