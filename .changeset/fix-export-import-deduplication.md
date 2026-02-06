---
"@kubb/fabric-core": patch
---

Fix export/import deduplication to preserve both type-only and non-type-only variants

When exports/imports exist with the same path+name but different `isTypeOnly` values, they are now correctly preserved instead of being deduplicated. This is important because `export { Type }` (exports both type and value) and `export type { Type }` (exports only type) serve different purposes and should both be kept.
