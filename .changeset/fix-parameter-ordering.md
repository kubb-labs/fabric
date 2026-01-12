---
"@kubb/react-fabric": patch
---

Fix parameter ordering in generated functions to follow TypeScript conventions: required → optional → default

The `order()` function in `getFunctionParams.ts` was incorrectly placing parameters with default values before optional parameters, which violates TypeScript's parameter ordering rules. This fix ensures generated function signatures place optional parameters before those with defaults.
