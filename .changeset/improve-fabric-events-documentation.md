---
'@kubb/fabric-core': minor
---

**BREAKING CHANGE**: Renamed events for consistency:
- `files:processing:update` → `file:processing:update` (singular, as it tracks individual file progress)
- `file:path:resolving` → `file:resolve:path` (clearer naming)
- `file:name:resolving` → `file:resolve:name` (clearer naming)

Improved FabricEvents documentation with comprehensive JSDoc comments. Each event now includes detailed descriptions, usage guidance, and property documentation. Updated READMEs with corrected event names organized into logical categories (Lifecycle, File Management, File Writing, File Processing) with examples.
