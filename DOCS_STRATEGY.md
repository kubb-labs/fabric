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

## TanStack-Style Approach: Unified Docs Site with Separate Source Repos

If you want to implement **TanStack's approach** (unified docs site that pulls from separate repos):

### Architecture Overview

```
kubb-labs/kubb.dev (new dedicated docs repo)
├─ .vitepress/
│  └─ config.ts           # Main VitePress config
├─ app/                   # Docs site app/framework
├─ public/                # Static assets
├─ kubb/                  # Symlink or git submodule → kubb-labs/kubb/docs
└─ fabric/                # Symlink or git submodule → kubb-labs/fabric/docs
```

### Implementation Steps

#### 1. Create Dedicated Docs Repository

Create new repository: `kubb-labs/kubb.dev`

```bash
# Structure
kubb.dev/
├─ package.json
├─ .vitepress/
│  ├─ config.ts
│  └─ theme/
├─ app/                   # Landing page, shared content
└─ README.md
```

#### 2. Set Up Docs in Source Repositories

**In kubb-labs/kubb:**
```
kubb/
└─ docs/
   ├─ getting-started/
   ├─ plugins/
   └─ ... (existing Kubb docs)
```

**In kubb-labs/fabric:**
```
fabric/
└─ docs/                  # NEW
   ├─ getting-started/
   ├─ core/
   ├─ plugins/
   └─ parsers/
```

#### 3. Link Docs into Main Site

**Option A: Git Submodules** (TanStack approach)

```bash
# In kubb.dev repo
git submodule add https://github.com/kubb-labs/kubb.git vendor/kubb
git submodule add https://github.com/kubb-labs/fabric.git vendor/fabric

# Create symlinks or copy during build
ln -s vendor/kubb/docs kubb
ln -s vendor/fabric/docs fabric
```

**Option B: Build-time Fetch** (Simpler for contributors)

```typescript
// scripts/fetch-docs.ts
import { execSync } from 'child_process'
import fs from 'fs'

// Clone or pull latest docs
const repos = [
  { name: 'kubb', url: 'https://github.com/kubb-labs/kubb.git' },
  { name: 'fabric', url: 'https://github.com/kubb-labs/fabric.git' }
]

repos.forEach(({ name, url }) => {
  if (!fs.existsSync(`vendor/${name}`)) {
    execSync(`git clone ${url} vendor/${name}`)
  } else {
    execSync(`cd vendor/${name} && git pull`)
  }
  
  // Copy docs to build location
  fs.cpSync(`vendor/${name}/docs`, name, { recursive: true })
})
```

**Option C: Sibling Repos** (Local development)

```bash
# Clone repos as siblings (for local dev)
parent/
├─ kubb.dev/              # Main docs site
├─ kubb/                  # Code repo with docs/
└─ fabric/                # Code repo with docs/

# In kubb.dev package.json
{
  "scripts": {
    "dev": "node scripts/link-docs.js && vitepress dev",
    "build": "node scripts/link-docs.js && vitepress build"
  }
}
```

#### 4. Configure VitePress

```typescript
// .vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kubb Docs',
  description: 'Toolkit for working with APIs and code generation',
  
  themeConfig: {
    nav: [
      { text: 'Kubb', link: '/kubb/' },
      { text: 'Fabric', link: '/fabric/' },
    ],
    
    sidebar: {
      '/kubb/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/kubb/getting-started/' },
            { text: 'Installation', link: '/kubb/getting-started/installation' }
          ]
        },
        {
          text: 'Plugins',
          items: [
            { text: 'Overview', link: '/kubb/plugins/' }
          ]
        }
      ],
      
      '/fabric/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/fabric/getting-started/' },
            { text: 'Quick Start', link: '/fabric/getting-started/quick-start' }
          ]
        },
        {
          text: 'Core',
          items: [
            { text: 'createFabric', link: '/fabric/core/create-fabric' }
          ]
        },
        {
          text: 'Plugins',
          items: [
            { text: 'fsPlugin', link: '/fabric/plugins/fs-plugin' },
            { text: 'barrelPlugin', link: '/fabric/plugins/barrel-plugin' }
          ]
        }
      ]
    },
    
    search: {
      provider: 'algolia', // or 'local'
      options: {
        // Configure unified search across all products
      }
    }
  },
  
  // Source directories
  srcDir: '.',
})
```

#### 5. Create Sync Script

```typescript
// scripts/link-docs.ts
import fs from 'fs'
import path from 'path'

const REPOS = ['kubb', 'fabric']

REPOS.forEach(repo => {
  const source = path.resolve(__dirname, `../../${repo}/docs`)
  const target = path.resolve(__dirname, `../${repo}`)
  
  // Check if running in CI or local
  if (fs.existsSync(source)) {
    // Local development - create symlink
    if (fs.existsSync(target)) fs.unlinkSync(target)
    fs.symlinkSync(source, target, 'dir')
    console.log(`✓ Linked ${repo} docs from sibling repo`)
  } else {
    console.warn(`⚠ ${repo} repo not found at ${source}`)
    console.log('  Clone repos as siblings or use git submodules')
  }
})
```

#### 6. Package.json Setup

```json
{
  "name": "@kubb/docs",
  "private": true,
  "scripts": {
    "dev": "pnpm run sync-docs && vitepress dev",
    "build": "pnpm run sync-docs && vitepress build",
    "sync-docs": "tsx scripts/link-docs.ts",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.0.0",
    "tsx": "^4.0.0"
  }
}
```

#### 7. CI/CD Pipeline

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [docs-updated] # Triggered from kubb/fabric repos
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Fetch docs from source repos
      - name: Clone Kubb docs
        run: |
          git clone --depth 1 https://github.com/kubb-labs/kubb.git vendor/kubb
          cp -r vendor/kubb/docs kubb
      
      - name: Clone Fabric docs
        run: |
          git clone --depth 1 https://github.com/kubb-labs/fabric.git vendor/fabric
          cp -r vendor/fabric/docs fabric
      
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      
      - run: pnpm install
      - run: pnpm run build
      
      - name: Deploy to Netlify/Vercel
        # Deploy built docs
```

#### 8. Trigger Updates from Source Repos

In `kubb` and `fabric` repos, add workflow to notify docs repo:

```yaml
# kubb/.github/workflows/update-docs.yml
name: Notify Docs Update

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger docs rebuild
        run: |
          curl -X POST \
            -H "Authorization: token ${{ secrets.DOCS_DEPLOY_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/kubb-labs/kubb.dev/dispatches \
            -d '{"event_type":"docs-updated","client_payload":{"repo":"kubb"}}'
```

### Pros of TanStack Approach

✅ **Docs live with code** - Contributors update docs alongside code changes
✅ **Unified experience** - Single site, unified search, consistent navigation
✅ **Independent repos** - Kubb and Fabric remain separate
✅ **Versioning flexibility** - Can version docs per product
✅ **Clear ownership** - Each team owns their docs in their repo

### Cons of TanStack Approach

❌ **More complex setup** - Requires submodules/sync scripts
❌ **Build complexity** - Must fetch/sync docs before building
❌ **Coordination** - Changes need to trigger rebuilds
❌ **Local development** - Contributors need multiple repos cloned
❌ **Higher maintenance** - Three repos instead of one

### Comparison: Option 1 vs TanStack Approach

| Aspect | Option 1 (Unified in Kubb) | TanStack Approach |
|--------|---------------------------|-------------------|
| Setup complexity | ⭐ Simple | ⭐⭐⭐ Complex |
| Docs location | Kubb repo only | Both repos |
| Build process | ⭐ Direct | ⭐⭐ Requires sync |
| Local dev | ⭐ Simple | ⭐⭐ Needs siblings |
| Contributor friction | ⭐ Low | ⭐⭐ Medium |
| Docs-code coupling | ✅ Can update together | ✅ Update together |
| Independence | ❌ Same repo | ✅ Separate repos |

### Recommendation

For Kubb + Fabric, **stick with Option 1** unless you specifically need:
- Separate repository ownership/permissions
- Different release cycles for docs vs code
- Team separation between products

The TanStack approach makes sense for TanStack because they have 8+ products with different maintainers. For 2 closely-related products with shared team, the added complexity isn't worth it.

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
