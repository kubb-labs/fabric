---
'@kubb/react-fabric': patch
---

Treat children with default values as optional when determining parent optionality in FunctionParams. When all children have either `optional: true` or a default value, the parent parameter now gets `= {}` appended, making it fully optional.
