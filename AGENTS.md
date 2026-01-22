# AGENTS.md
This repository contains Fabric — a language-agnostic toolkit for generating code and files using JSX and TypeScript.


## Folder structure

Expanded overview focused on plugins and where to find their docs and source code.

```
docs/
├── changelog.md          # Updated with every PR (via changeset)
├── getting-started/      # Getting started guides (quick-start, configure, troubleshooting)
├── tutorials/            # Step-by-step tutorials
├── examples/             # Playground and examples used in docs
```

Repository-level layout with focus on plugin packages and their source layout:

```
packages/
├── fabric-core/                 # Core utilities and shared runtime
└── react-fabric/                # React-fabric layer
```

Notes:
- The `docs/plugins/*` folders contain user-facing documentation for each plugin and usually mirror the `packages/plugin-*/` source layout (options, examples, and usage).
- Plugin source convention: `packages/plugin-*/src/components/` holds React-fabric components, `src/generators/` holds generator implementations, and `src/*.test.ts` or `src/tests/` contains tests.
- When adding a new plugin, add both a `packages/plugin-name/` package and a corresponding `docs/plugins/plugin-name/` docs folder (see `docs/plugins/*` for examples).

## Repository facts

- **Monorepo**: Managed by pnpm workspaces and Turborepo
- **Module system**: ESM-only (`type: "module" across repo)
- **Node version**: 20
- **Versioning**: Changesets for versioning and publishing
- **CI/CD**: GitHub Actions

## Setup commands

```bash
pnpm install                # Install dependencies
pnpm clean                  # Clean build artifacts
pnpm build                  # Build all packages
pnpm generate               # Generate code from OpenAPI specs
pnpm perf                   # Run performance tests
pnpm test                   # Run tests
pnpm typecheck              # Type check all packages
pnpm format                 # Format code
pnpm lint                   # Lint code
pnpm lint:fix               # Lint and fix issues
pnpm changeset              # Create changelog entry
pnpm run upgrade && pnpm i   # Upgrade dependencies
```

This file is intentionally minimal. Agents and contributors should consult the repository's skills for detailed guidance:

<skills>

## Skills

You have new skills. If any skill might be relevant then you MUST read it.

- [changelog](.skills/changelog/SKILL.md) - Automatically creates user-facing changelogs from git commits by analyzing commit history, categorizing changes, and transforming technical commits into clear, customer-friendly release notes. Turns hours of manual changelog writing into minutes of automated generation.
- [coding-style](.skills/coding-style/SKILL.md) - Coding style, testing, and PR guidelines for the Kubb ecosystem. Use when writing or reviewing code for the Kubb ecosystem.
- [documentation](.skills/documentation/SKILL.md) - Use when writing blog posts or documentation markdown files - provides writing style guide (active voice, present tense) and content structure patterns. Overrides brevity rules for proper grammar.
- [pr](.skills/pr/SKILL.md) - Rules and checklist for preparing PRs, creating changesets, and releasing packages in the monorepo.
- [testing](.skills/testing/SKILL.md) - Testing, CI, and troubleshooting guidance for running the repository's test suite and interpreting CI failures.
</skills>
