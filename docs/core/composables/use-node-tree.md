---
layout: doc
title: useNodeTree Hook - Access Component Tree Structure
description: Access the component node tree structure for debugging and tracking component hierarchy in Fabric.
outline: deep
---

# useNodeTree Hook

The useNodeTree composable accesses the component node tree structure for tracking component hierarchy and debugging.

**Use useNodeTree when:** Building debugging tools, tracking component hierarchy, or implementing custom devtools.

**Perfect for:** Debugging utilities, component tracking, metadata storage, custom tooling.

## Usage

Access the component tree node structure.

**Example:** Access and manipulate the node tree.

```ts twoslash
import { useNodeTree } from '@kubb/fabric-core'

function MyComponent() {
  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({
      type: 'MyComponent',
      props: {}
    })
  }

  return null
}
```

## Return Value

Returns the current `TreeNode<ComponentNode>` or `null` if not within a component that provides `NodeTreeContext`.

## When to Use

Use `useNodeTree` when you need to:
- Track component hierarchy
- Debug rendering
- Build custom devtools or debugging utilities
- Store component metadata and relationships

## Examples

### Tracking Component Hierarchy

```ts twoslash
import { useNodeTree, provide, NodeTreeContext } from '@kubb/fabric-core'

function MyComponent({ children }: { children: any }) {
  const nodeTree = useNodeTree()

  if (nodeTree) {
    // Add this component to the tree
    const childTree = nodeTree.addChild({
      type: 'MyComponent',
      props: { name: 'example' }
    })

    // Provide the child tree for nested components
    provide(NodeTreeContext, childTree)
  }

  return children
}
```

## See Also

- [Fabric](/core/components/fabric) - Fabric container component
- [Root](/core/components/root) - Root component with tree structure
- [useContext](/core/composables/use-context) - Generic context access

