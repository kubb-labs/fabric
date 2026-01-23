# Contribution Guidelines

When contributing to `Kubb`, whether on GitHub or in other community spaces:

- Be respectful, civil, and open-minded.
- Before opening a new pull request, try searching through the [issue tracker](https://github.com/kubb-labs/fabric/issues) for known issues or fixes.
- If you want to make code changes based on your personal opinion(s), make sure you open an issue first describing the changes you want to make, and open a pull request only when your suggestions get approved by maintainers.

## How to Contribute

### Prerequisites

In order to not waste your time implementing a change that has already been declined, or is generally not needed, start by [opening an issue](https://github.com/kubb-labs/fabric/issues/new) describing the problem you would like to solve.

### Setup your environment locally

_Some commands will assume you have the GitHub CLI installed, if you haven't, consider [installing it](https://github.com/cli/cli#installation), but you can always use the Web UI if you prefer that instead._

In order to contribute to this project, you will need to fork the repository:

```bash
gh repo fork kubb-labs/fabric
```

then, clone it to your local machine:

```bash
gh repo clone <your-github-name>/kubb
```

### Implement your changes

This project includes several code quality tools to help maintain code standards:

- **Linting**: Run `pnpm run lint` to check code style (uses Biome)
- **Formatting**: Run `pnpm run format` to auto-format code
- **Type checking**: Run `pnpm run typecheck` to verify TypeScript types
- **Spell checking**: Run `pnpm run lint:spell` to check spelling in `.ts` and `.md` files (uses CSpell)
- **Testing**: Run `pnpm run test` to run the test suite

#### Spell Checking

This project uses [CSpell](https://cspell.org/) to catch spelling errors in code and documentation. The configuration is in `cspell.json` and uses American English.

If you encounter a spelling error:
- For typos: Fix the spelling in your code
- For technical terms, library names, or contributor names: Add them to the `words` array in `cspell.json`

Common technical terms, framework names, and contributor names are already in the dictionary.

### When you're done

When all that's done, it's time to file a pull request to upstream:

**NOTE**: All pull requests should target the `main` branch.

## Credits

This documented was inspired by the contributing guidelines for [create-t3-app](https://github.com/t3-oss/create-t3-app/blob/next/CONTRIBUTING.md).
