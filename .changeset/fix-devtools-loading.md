---
"@kubb/react-fabric": patch
---

Fix React DevTools stuck at "Loading React element tree" by ensuring renderer injection happens after react-devtools-core is imported but before connectToDevTools() is called
