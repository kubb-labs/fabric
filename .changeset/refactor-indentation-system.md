---
"@kubb/fabric-core": minor
"@kubb/react-fabric": minor
---

Refactor indentation system with custom implementation using intrinsic elements. This change removes the external `dedent` dependency and introduces a new indentation mechanism using `<indent>`, `<dedent>`, and `<br>` intrinsic elements along with a `RenderContext` to track and apply indentation during code generation. The new approach provides more precise control over indentation and improves performance by eliminating third-party dependencies.
