# React Intrinsic Components

React intrinsic components provide precise control over whitespace, line breaks, and indentation in code generation using familiar React patterns. These are React equivalents of the fabric-core intrinsic elements.

See [fabric-core/INTRINSICS.md](../../fabric-core/src/INTRINSICS.md) for a comprehensive guide on the intrinsic system.

## Quick Reference

### Line Breaks

```tsx
<Br />        {/* Line break with indentation */}
<Hbr />       {/* Hard break (always) */}
<Sbr />       {/* Soft break (if needed) */}
<Lbr />       {/* Literal break (no indent) */}
```

### Indentation

```tsx
<IndentIncrease />  {/* Increase indent level */}
<IndentDecrease />  {/* Decrease indent level */}
```

### Advanced

```tsx
<Align />                          {/* Align to current column */}
<Group>{content}</Group>           {/* Try single line first */}
<IfBreak                           {/* Conditional content */}
  thenContent={<>{...}</>}
  elseContent={<>{...}</>}
/>
<IndentIfBreak />                  {/* Indent if parent breaks */}
<Fill>{content}</Fill>             {/* Fill with breaks */}
```

## Examples

### Function Component

**Before (Manual):**
```tsx
export function Function({ name, children }: Props) {
  return (
    <>
      function {name}() {'{'}
      {'\n'}
      {'  '}{children}
      {'\n'}
      {'}'}
    </>
  )
}
```

**After (Intrinsics):**
```tsx
import { Br, IndentIncrease, IndentDecrease } from '@kubb/react-fabric'

export function Function({ name, children }: Props) {
  return (
    <>
      function {name}() {'{'}
      <IndentIncrease />
      <Br />
      {children}
      <IndentDecrease />
      <Br />
      {'}'}
    </>
  )
}
```

### Nested Indentation

```tsx
<>
  class {name} {'{'}
  <IndentIncrease />
  <Br />
  {methods.map(method => (
    <>
      {method.name}() {'{'}
      <IndentIncrease />
      <Br />
      {method.body}
      <IndentDecrease />
      <Br />
      {'}'}
    </>
  ))}
  <IndentDecrease />
  <Br />
  {'}'}
</>
```

Intrinsics automatically handle nested indentation!

### Conditional Formatting

```tsx
<>
  [{items}
  <IfBreak 
    thenContent={<Br />} 
    elseContent={<></>}
  />]
</>
```

## Integration

The React renderer automatically processes intrinsic components during rendering. No special setup required!

```tsx
import { Br, IndentIncrease, IndentDecrease } from '@kubb/react-fabric'

export function MyComponent() {
  return (
    <File baseName="example.ts">
      function hello() {'{'}
      <IndentIncrease />
      <Br />
      console.log("Hello, World!")
      <IndentDecrease />
      <Br />
      {'}'}
    </File>
  )
}
```

## API Reference

See the main [INTRINSICS.md](../../fabric-core/src/INTRINSICS.md) documentation for detailed explanations of each intrinsic type and advanced usage patterns.

## Migration from Indent Component

The `Indent` component is still available for convenience, but you can now use intrinsics for more precise control:

**Old:**
```tsx
<Indent size={2}>
  {content}
</Indent>
```

**New:**
```tsx
<IndentIncrease />
<Br />
{content}
<IndentDecrease />
```

Both approaches work, choose based on your needs!
