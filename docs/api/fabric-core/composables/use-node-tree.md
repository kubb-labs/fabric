---
layout: doc
title: useNodeTree
outline: deep
---

# useNodeTree

Composable for accessing the component node tree.

## Signature

```ts
function useNodeTree(): TreeNode<ComponentNode> | null
```

## Returns

Returns the current `TreeNode<ComponentNode>` or `null` if not within a component that provides NodeTreeContext.

## Usage

### Basic Usage

```ts [basic.ts]
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

### Tracking Component Hierarchy

```ts [tracking.ts]
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

## When to Use

Use `useNodeTree` when you need to:

- **Track component hierarchy** - Build a tree structure of rendered components
- **Debug rendering** - Inspect the component tree during development
- **Custom tooling** - Build devtools or debugging utilities
- **Component metadata** - Store information about component relationships

## See Also

- [App](/api/fabric-core/components/app) - App container component
- [Root](/api/fabric-core/components/root) - Root component with tree structure
