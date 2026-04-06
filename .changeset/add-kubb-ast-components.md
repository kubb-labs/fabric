---
"@kubb/react-fabric": minor
"@kubb/fabric-core": minor
---

Add `KubbFunction`, `KubbConst`, and `KubbType` custom components that render `kubb-function`, `kubb-const`, and `kubb-type` DOM elements for transformation into Kubb AST nodes. Add `createFunction`, `createConst`, and `createTypeAlias` AST factory functions in `typescriptParser`. Add `nodes?: Array<ts.Node>` to `KubbFile.Source` and a `squashSourceNodes` utility that collects AST nodes from the new DOM elements.
