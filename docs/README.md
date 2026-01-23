# Fabric Documentation

This directory contains the markdown documentation for Kubb Fabric.

> [!IMPORTANT]
> This folder contains **only markdown files**. VitePress configuration and tooling are in a separate project.

## About This Documentation

The documentation is written in VitePress-compatible markdown but does not include VitePress itself. This keeps the main Fabric repository focused on code, not documentation tooling.

## Using These Docs

### Option 1: Read as Markdown
All documentation is readable as plain markdown files. Start with [index.md](./index.md).

### Option 2: Set Up VitePress (Separate Project)
To preview with VitePress:

1. Create a separate VitePress project
2. Copy these markdown files to that project
3. Configure VitePress there (see [vitepress-setup-explanation.md](./vitepress-setup-explanation.md))
4. Run VitePress in that project

## Structure

```
docs/
├── getting-started/
│   ├── introduction.md        # What is Fabric
│   ├── installation.md        # Installation guide
│   ├── quick-start.md         # Quick start tutorial
│   ├── configuration.md       # Configuration guide
│   └── troubleshooting.md     # Common issues
├── api/
│   ├── core/
│   │   ├── create-fabric.md   # Main API reference
│   │   └── events.md          # Lifecycle events
│   ├── plugins/
│   │   ├── fs-plugin.md       # File system plugin
│   │   ├── logger-plugin.md   # Logger plugin
│   │   └── barrel-plugin.md   # Barrel plugin
│   └── parsers/
│       └── typescript-parser.md
├── guide/
│   ├── creating-plugins.md    # Plugin development
│   └── file-generation-patterns.md
├── tutorials/
│   └── building-code-generator.md
├── public/                    # Static assets
├── index.md                   # Homepage
├── README.md                  # This file
└── vitepress-setup-explanation.md  # VitePress config guide
```

## VitePress Configuration

VitePress configuration **does not belong in this repository**. See [vitepress-setup-explanation.md](./vitepress-setup-explanation.md) for:

- Why VitePress is separate
- How to set up VitePress in another project
- Example configuration structure
- Recommended sidebar and navigation setup

## Writing Documentation

When adding new documentation:

1. Create markdown files in the appropriate directory
2. Add frontmatter with `layout: doc`, `title`, and `outline: deep`
3. Follow the documentation style guide in `../.skills/documentation/`
4. Use proper VitePress markdown features (code groups, alerts, etc.)

See the [documentation skill](../.skills/documentation/SKILL.md) for detailed guidelines.

## Contributing

When adding new documentation:

1. Create markdown files in the appropriate directory
2. Add frontmatter with `layout: doc`, `title`, and `outline: deep`
3. Update `.vitepress/config.ts` to add navigation/sidebar entries
4. Follow the documentation style guide in `.skills/documentation/`
5. Test locally with `npm run dev`

## See Also

- [VitePress Documentation](https://vitepress.dev)
- [Fabric Repository](https://github.com/kubb-labs/fabric)
- [Report Issues](https://github.com/kubb-labs/fabric/issues)
