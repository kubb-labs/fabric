# Intrinsic Formatting Elements

Intrinsic formatting elements provide precise control over whitespace, line breaks, and indentation in code generation. Inspired by the [Alloy framework](https://github.com/alloy-framework/alloy), these first-class formatting primitives make complex code layouts easier to create and maintain.

## Table of Contents

- [Overview](#overview)
- [Basic Concept](#basic-concept)
- [Available Intrinsics](#available-intrinsics)
- [How It Works](#how-it-works)
- [Examples](#examples)
- [Migration Guide](#migration-guide)

## Overview

Instead of manually managing newlines (`\n`) and indentation strings, intrinsics are special objects that describe formatting intent. A renderer processes these objects to produce the final formatted string.

**Benefits:**
- **Context-aware**: Line breaks know the current indentation level
- **Composable**: Nested components inherit formatting state automatically
- **Declarative**: Express formatting intent, not implementation
- **Clean code**: No manual calculation of spaces or newline positions

## Basic Concept

### Traditional Approach (Manual)

```typescript
const code = `function hello() {\n  console.log("hi")\n}`
// Hard to maintain, error-prone with nesting
```

### Intrinsic Approach (Declarative)

```typescript
import { br, indent, dedent } from '@kubb/fabric-core'

const code = renderIntrinsics(['function hello() {', indent, br, 'console.log("hi")', dedent, br, '}'])
// Output: "function hello() {\n  console.log("hi")\n}"
```

The renderer automatically:
- Tracks indentation level
- Inserts appropriate whitespace
- Handles nested indentation
- Maintains consistent formatting

## Available Intrinsics

### Line Breaks

#### `br` - Regular Line Break
Adds a newline with the current indentation level.

```typescript
code`hello${br}world`
// => "hello\n  world" (with current indent)
```

#### `hbr` - Hard Break
Always breaks, regardless of context. Use when you absolutely need a line break.

```typescript
code`before${hbr}after`
// => "before\nafter"
```

#### `sbr` - Soft Break
Breaks only if needed (e.g., line too long). In basic implementation, behaves like `br`.

```typescript
code`text${sbr}more text`
// => "text\nmore text" (or same line if fits)
```

#### `lbr` - Literal Break
Raw newline without indentation. Useful for specific formatting needs.

```typescript
code`line1${lbr}line2`
// => "line1\nline2" (no indent on line2)
```

### Indentation

#### `indent` - Increase Indentation
Increases the indentation level for all subsequent content until `dedent`.

```typescript
code`{${indent}${br}content${dedent}${br}}`
// => "{\n  content\n}"
```

#### `dedent` - Decrease Indentation
Decreases the indentation level.

```typescript
code`outer${indent}${br}inner${dedent}${br}outer again`
// => "outer\n  inner\nouter again"
```

### Advanced Formatting

#### `align` - Column Alignment
Aligns subsequent content to the current column position. Useful for parameter lists.

```typescript
// Align parameters
function render(name, ${align}
                type, ${align}
                value)
```

#### `group(template)` - Smart Grouping
Tries to fit content on a single line. If it doesn't fit, breaks according to internal break points.

```typescript
group`function ${name}(${params})`
// => "function foo(x, y)" if fits
// => "function foo(\n  x,\n  y\n)" if doesn't fit
```

#### `ifBreak(thenContent, elseContent)` - Conditional Formatting
Renders different content based on whether the parent group breaks.

```typescript
code`(${params}${ifBreak(',', '')})`
// Adds comma only if params are on multiple lines
```

#### `indentIfBreak` - Conditional Indentation
Indents only if the parent group breaks.

```typescript
code`(${indentIfBreak}${params}${dedent})`
```

#### `fill(template)` - Paragraph Fill
Fills content with line breaks when it gets too long. Useful for paragraph-style text.

```typescript
fill`This is a long sentence that will wrap when needed.`
```

## How It Works

### 1. Component Creates Intrinsics

Instead of strings with embedded `\n`, components use intrinsic objects:

```typescript
import { fsx, code, br, indent, dedent } from '@kubb/fabric-core'

export const Function = fsx((props: { name: string; children?: string }) => {
  return code`function ${props.name}() {${indent}${br}${props.children}${dedent}${br}}`
})
```

### 2. Intrinsic Objects

Each intrinsic is an object with a type:

```typescript
{ type: 'br', __intrinsic: true }
{ type: 'indent', __intrinsic: true }
{ type: 'group', content: [...], __intrinsic: true }
```

### 3. Renderer Processes Them

The renderer maintains context (indent level, line length, etc.) and processes each intrinsic:

```typescript
const context = {
  indentLevel: 0,
  indentSize: 2,
  currentLineLength: 0,
  shouldBreak: false
}

// Processing
- See "function hello() {" → add to output
- See { type: 'indent' } → indentLevel++
- See { type: 'br' } → add "\n" + ("  " * indentLevel)
- See "console.log..." → add to output
- See { type: 'dedent' } → indentLevel--
- See { type: 'br' } → add "\n" + ("  " * indentLevel)
- See "}" → add to output
```

### 4. Final Output

```typescript
function hello() {
  console.log("hi")
}
```

## Examples

### Function Component

**Before (Manual):**
```typescript
export const Function = fsx((props) => {
  const body = props.children 
    ? `\n${Indent({ size: 2, children: props.children })}\n`
    : ''
  return `function ${props.name}() {${body}}`
})
```

**After (Intrinsics):**
```typescript
export const Function = fsx((props) => {
  return code`function ${props.name}() {${indent}${br}${props.children}${dedent}${br}}`
})
```

### Multi-line Parameters

**Before:**
```typescript
const params = longParams.join(',\n  ')
const signature = `function ${name}(\n  ${params}\n)`
```

**After:**
```typescript
const signature = group`function ${name}(${indent}${br}${params}${dedent}${br})`
// Stays on one line if it fits, breaks if too long
```

### Conditional Formatting

```typescript
// Add trailing comma only in multi-line mode
const list = code`[${indent}${ifBreak(br, '')}${items}${ifBreak(br, '')}${dedent}]`
```

### Nested Indentation

```typescript
code`class ${name} {${indent}${br}${methods.map(m => 
  code`${m.name}() {${indent}${br}${m.body}${dedent}${br}}`
)}${dedent}${br}}`
```

Intrinsics automatically handle nested indentation - no manual calculation needed!

## Migration Guide

### From `Indent` Component

**Old:**
```typescript
import { Indent } from '@kubb/fabric-core'

const body = Indent({ size: 2, children: content })
const result = `{\n${body}\n}`
```

**New:**
```typescript
import { br, indent, dedent } from '@kubb/fabric-core'

const result = code`{${indent}${br}${content}${dedent}${br}}`
```

### From Manual Newlines

**Old:**
```typescript
const code = [
  'function hello() {',
  '  console.log("hi")',
  '  return true',
  '}'
].join('\n')
```

**New:**
```typescript
const code = renderIntrinsics([
  'function hello() {',
  indent,
  br,
  'console.log("hi")',
  br,
  'return true',
  dedent,
  br,
  '}'
])
```

### Integrating with `fsx()`

The `code` tagged template now automatically handles intrinsics:

```typescript
import { fsx, code, br, indent, dedent } from '@kubb/fabric-core'

const Component = fsx((props) => {
  return code`function ${props.name}() {${indent}${br}${props.body}${dedent}${br}}`
})

// Use it
const result = Component({ name: 'test', body: 'return 42' })()
// => "function test() {\n  return 42\n}"
```

## Best Practices

1. **Use `br` for standard line breaks** - It automatically applies indentation
2. **Pair `indent` with `dedent`** - Always balance indentation changes
3. **Use `group` for optional breaking** - Let the renderer decide when to break
4. **Use `hbr` sparingly** - Only when you need guaranteed breaks
5. **Leverage `ifBreak` for conditional content** - Comma placement, trailing breaks, etc.

## Advanced Usage

### Custom Rendering

You can customize the rendering behavior by implementing your own renderer:

```typescript
import { renderIntrinsics, type RenderContext } from '@kubb/fabric-core'

const customContext: RenderContext = {
  indentLevel: 0,
  indentSize: 4,  // 4 spaces instead of 2
  currentLineLength: 0,
  shouldBreak: false
}

const result = renderIntrinsics(content, customContext)
```

### Pretty Printing

Enhance the renderer to support pretty printing with line length limits:

```typescript
// Future enhancement: smart breaking based on line length
const prettyRender = (content, maxLineLength = 80) => {
  // Check line lengths, break groups when needed, etc.
}
```

## React Integration

Intrinsics work seamlessly with React components too. The React renderer processes intrinsic elements during the rendering phase.

```tsx
import { br, indent, dedent } from '@kubb/fabric-core'

export function FunctionComponent({ name, children }: Props) {
  return (
    <>
      function {name}() {'{ '}
      {indent}
      {br}
      {children}
      {dedent}
      {br}
      {'}'}
    </>
  )
}
```

## Future Enhancements

- **Smart line breaking**: Automatically break lines that exceed max length
- **Comment preservation**: Handle comment placement with intrinsics
- **Language-specific formatters**: Different rules for TypeScript, Python, etc.
- **Pretty printer integration**: Full Prettier-style formatting
- **Performance optimizations**: Efficient rendering for large codebases

---

For more information, see the [Alloy framework documentation](https://alloy-framework.github.io/alloy/) which inspired this system.
