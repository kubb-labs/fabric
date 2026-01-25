---
layout: doc
title: useNodeTree
outline: deep
---

# useNodeTree

Composable for accessing the component node tree structure.

## Usage

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

function MyComponent({ children }) {
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

- [App](/core/components/app) - App container component
- [Root](/core/components/root) - Root component with tree structure
- [useContext](/core/composables/use-context) - Generic context access

