# Contributing to Colonels Academy

## Prerequisites

- Node.js >= 20.11.0
- pnpm >= 10.0.0 (via `corepack enable`)
- Docker (for Postgres and Redis)

## First-time setup

```sh
corepack enable
corepack pnpm install   # also installs the pre-commit hook via the prepare script
cp .env.example .env    # fill in Firebase and Bunny credentials
docker compose -f compose.yaml up -d
corepack pnpm db:generate
corepack pnpm db:push
corepack pnpm db:seed
```

## Code formatting — Biome

This project uses [Biome](https://biomejs.dev) for formatting and linting. A single tool replaces both Prettier and ESLint.

### Rules at a glance

| Setting | Value |
|---------|-------|
| Indent | 2 spaces |
| Line width | 100 |
| Quotes | Double (`"`) |
| Trailing commas | None |

### Running Biome

```sh
# Check for formatting and lint issues (read-only, used in CI):
corepack pnpm biome:check

# Auto-format the whole repo:
corepack pnpm biome:format
```

### Pre-commit hook

`pnpm install` sets up a git pre-commit hook automatically (via the `prepare` script). On every commit the hook runs `pnpm biome:format` and re-stages any files it rewrites, so the committed result is always formatted.

If the hook is ever missing (e.g. after a fresh clone on a machine that skipped `prepare`), reinstall it with:

```sh
sh scripts/setup-hooks.sh
```

### CI enforcement

The `quality` job in CI runs `pnpm biome:check` on every push and pull request. A PR with formatting or lint violations will not pass the required `ci-gate` check.

### Editor integration

Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for inline diagnostics and format-on-save. The workspace config already points at `biome.json`.

## Validation commands

```sh
corepack pnpm biome:check        # formatting + lint
corepack pnpm check:boundaries   # import boundary guardrails
corepack pnpm typecheck          # TypeScript across all packages
corepack pnpm build              # production builds
corepack pnpm validate           # all three checks in sequence
```

## Branch and PR workflow

- Work off `dev`, not `main`.
- `main` is the production branch; only merge from `dev` via a reviewed PR.
- The `ci-gate` status check must pass before a PR can be merged.
- Changes to `packages/contracts` or `packages/database` require Backend Lead review (enforced via CODEOWNERS).

## Database workflow

| Situation | Command |
|-----------|---------|
| Local prototyping | `corepack pnpm db:push` |
| Shared team development | `corepack pnpm db:migrate` |
| Staging / production | `corepack pnpm db:deploy` |
| Pre-release check | `corepack pnpm db:status` |
