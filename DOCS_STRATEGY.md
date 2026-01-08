# Documentation Strategy for Kubb and Fabric

**Status**: Research Complete  
**Date**: January 2026  
**Decision**: Pending team review

## Background

This document outlines the research and recommendations for combining documentation between:
- **Kubb** (kubb-labs/kubb): The main API toolkit for OpenAPI/Swagger code generation
- **Fabric** (kubb-labs/fabric): Language-agnostic code generation toolkit using JSX

## Current State

- **Kubb**: Has comprehensive VitePress documentation at https://kubb.dev with full docs folder
- **Fabric**: Has only README.md files; no structured documentation site yet
- Both projects share the kubb.dev domain
- Fabric's package.json references a `build:docs` script pointing to non-existent docs folder

## Comparison with Similar Projects

To inform our decision, we analyzed how other popular TypeScript ecosystem projects handle documentation for multiple related packages:

### TanStack (React Query, Router, Table, etc.)

**Approach**: **Unified documentation site** (tanstack.com) for all libraries

**Structure**:
- Single domain (tanstack.com) hosts docs for Query, Router, Table, Form, Virtual, Store, etc.
- Markdown files live in each library's GitHub repo (e.g., `tanstack/query/docs/`)
- Main docs site fetches and renders markdown from individual repos
- Shared navigation, search (Algolia), theme, and UX across all libraries
- Framework selector (React, Vue, Solid, etc.) and version switcher built-in
- Local development: clone tanstack.com + library repos as siblings for preview

**Key Benefits**:
- ✅ Consistent user experience across all TanStack products
- ✅ Unified search finds answers across any TanStack library
- ✅ Single deployment/hosting for entire ecosystem
- ✅ Easy cross-library navigation and discovery
- ✅ Shared infrastructure reduces duplication

**Similar to**: Our Option 1 (unified docs in main repo)

### Zod (Schema Validation)

**Approach**: **Single repository documentation** (zod.dev)

**Structure**:
- Main repository (colinhacks/zod) contains all documentation
- Markdown-based docs in the main repo
- Single product with ecosystem integrations documented
- Automated deployment via GitHub Actions to zod.dev
- Documentation versioned alongside code releases
- CI/CD rebuilds and deploys on main branch updates

**Key Benefits**:
- ✅ Simple, straightforward structure
- ✅ Docs always in sync with code
- ✅ Single source of truth
- ✅ Easy for contributors to update docs with code changes

**Similar to**: Our current Kubb setup (single repo for main product)

### Key Insights for Kubb + Fabric

Both TanStack and Zod validate our **Option 1 recommendation**:

1. **TanStack's approach** shows that unified documentation for multiple related products creates excellent UX and discoverability - exactly what we need for Kubb + Fabric
2. **TanStack's success** with 8+ libraries under one docs site proves this scales well beyond 2 products
3. **Single domain strategy** (tanstack.com, zod.dev) aligns with our kubb.dev domain
4. **Markdown-based content** makes migration easy if we ever need to split (like VitePress)
5. **Industry pattern**: Most successful TypeScript tooling ecosystems use unified docs for related products

**Differences from our situation**:
- TanStack fetches docs from separate repos (we'd embed directly)
- Both have larger teams, but still benefit from unified approach
- Our products are even more closely related (Fabric could power Kubb)

## Research Summary

Three primary options were evaluated:

### Option 1: Unified Documentation in Kubb Main Repository ⭐ RECOMMENDED

**Approach**: Add Fabric documentation as a `/docs/fabric` section within the existing Kubb documentation at kubb.dev

**Key Benefits**:
- Single source of truth for all Kubb Labs documentation
- Unified search across both products
- Atomic updates when features cross product boundaries
- Lower maintenance burden (one VitePress site)
- Better user experience and discoverability
- Easier to implement (Fabric docs don't exist yet)

**Trade-offs**:
- Couples Fabric docs to Kubb repository
- Longer combined build time
- Less granular access control

**Best For**: Our current situation - small team, related products, shared domain

### Option 2: Fabric Documentation in Fabric Repository

**Approach**: Create separate `/docs` folder in Fabric repo with its own VitePress setup, deployed to fabric.kubb.dev or kubb.dev/fabric

**Key Benefits**:
- Independent release cycles
- Faster iteration on Fabric docs
- Clear product separation
- Aligns docs with code location

**Trade-offs**:
- Requires duplicate VitePress setup
- Need shared theme package for consistency
- Coordination overhead for cross-product changes
- Split search experience

**Best For**: If products diverge significantly or have different teams

### Option 3: Dedicated Documentation Repository

**Approach**: Create new kubb-labs/docs repository aggregating both projects

**Key Benefits**:
- Separation of docs from code
- Can easily add more products later
- Specialized docs workflow

**Trade-offs**:
- High synchronization complexity
- Additional repository to maintain
- Risk of docs drifting from code
- Git submodules or complex CI/CD

**Best For**: Large organizations with 5+ products and dedicated doc teams

**NOT RECOMMENDED** for our use case

## Recommendation: Option 1

After evaluating all options, **Option 1 (Unified Documentation in Kubb Main Repository)** is recommended because:

1. **Timing**: Fabric docs don't exist yet - easier to start in the right place
2. **Team efficiency**: Small team benefits from single site maintenance
3. **User experience**: Unified search and navigation benefits developers
4. **Ecosystem coherence**: Both products share kubb.dev domain and audience
5. **Future flexibility**: Can migrate to Option 2 later if needed (VitePress content is portable)
6. **Cost effective**: Minimal setup, low ongoing maintenance
7. **Industry validation**: TanStack's success with unified docs for 8+ libraries proves this approach scales excellently for related products

## Implementation Plan (If Option 1 Approved)

1. Create issue in kubb-labs/kubb to add Fabric documentation section
2. Add `/docs/fabric` folder in Kubb repository with structure:
   ```
   docs/fabric/
   ├─ getting-started/
   ├─ core/
   ├─ react-fabric/
   ├─ plugins/
   ├─ parsers/
   ├─ examples/
   └─ api-reference/
   ```
3. Update VitePress navigation to include Fabric section
4. Migrate content from Fabric README files to proper documentation
5. Set up cross-linking between Kubb and Fabric docs
6. Update Fabric repo README to point to kubb.dev/fabric
7. Remove or update build:docs script in Fabric package.json

## Alternative: Option 2 Implementation

If Option 2 is preferred instead:

1. Create `/docs` folder in Fabric repository
2. Set up VitePress configuration
3. Create `@kubb/docs-theme` shared package
4. Configure deployment to fabric.kubb.dev
5. Implement cross-site navigation links
6. Set up separate CI/CD pipeline

## Migration Path

If starting with Option 1 and later needing Option 2:
- VitePress documentation is markdown-based
- Content migration is straightforward (copy/move markdown files)
- Navigation and theme would need reconfiguration
- Estimated effort: 1-2 days

## Next Steps

1. Review this research with the team
2. Make a decision on which option to pursue
3. Create implementation issues in appropriate repository
4. Begin documentation development

## Resources

- Full research document: See `/tmp/research-combining-docs.md` in PR
- Kubb main docs: https://github.com/kubb-labs/kubb/tree/main/docs
- VitePress documentation: https://vitepress.dev
- Current Fabric README: https://github.com/kubb-labs/fabric/blob/main/README.md

### Industry Examples Analyzed

- **TanStack**: https://tanstack.com - Unified docs for Query, Router, Table, Form, etc.
  - GitHub: https://github.com/tanstack/tanstack.com
  - Demonstrates excellent unified documentation for multiple libraries
- **Zod**: https://zod.dev - Single-repo documentation approach
  - GitHub: https://github.com/colinhacks/zod
  - Shows simplicity of docs-with-code approach

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 2026 | Research completed | Three options evaluated with recommendation for Option 1 |
| TBD | Final decision pending | Awaiting team review |

---

**Note**: This is a research document. No code or file moves have been performed as requested in the issue. The recommendation is to pursue Option 1 (unified documentation in Kubb main repository), but the final decision should be made by the team after reviewing the full research.
