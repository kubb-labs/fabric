# AGENTS.md

Fabric is a language-agnostic toolkit for generating code and files using JSX and TypeScript.

## Folder Structure

### Documentation

```
docs/
├── config.json              # Navigation and sidebar (Kubb.dev schema)
├── guide/                   # Installation, quick-start, configuration
├── api/                     # API references (core, plugins, parsers)
├── guide/                   # Plugin development, best practices
├── tutorials/               # End-to-end tutorials
└── public/                  # Static assets
```

All markdown files follow VitePress conventions. The `config.json` file uses the Kubb.dev schema for navigation. See `.skills/documentation/` for writing guidelines.

### Packages

```
packages/
├── fabric-core/             # Core utilities and runtime
└── react-fabric/            # React-fabric layer
```

Plugins follow this convention:
- `src/components/` - React-fabric components
- `src/generators/` - Generator implementations
- `src/*.test.ts` - Tests

## Repository Setup

- **Monorepo** - Uses pnpm workspaces and Turborepo
- **Module system** - ESM-only (`type: "module"`)
- **Node version** - 20
- **Versioning** - Changesets
- **CI/CD** - GitHub Actions

## Commands

```bash
pnpm install                 # Install dependencies
pnpm clean                   # Clean build artifacts
pnpm build                   # Build all packages
pnpm test                    # Run tests
pnpm typecheck               # Type check packages
pnpm lint                    # Lint code
pnpm lint:fix                # Lint and fix issues
pnpm changeset               # Create changelog entry
pnpm run upgrade && pnpm i   # Upgrade dependencies
```

## Skills

Use the skills in `.skills/` for detailed guidance:

- **[changelog](.skills/changelog/SKILL.md)** - Generate changelogs from commits
- **[coding-style](.skills/coding-style/SKILL.md)** - Code style and testing guidelines
- **[documentation](.skills/documentation/SKILL.md)** - Writing style and content patterns
- **[pr](.skills/pr/SKILL.md)** - PR preparation and changesets
- **[testing](.skills/testing/SKILL.md)** - Test suite and CI guidance
