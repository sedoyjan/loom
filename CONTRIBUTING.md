# Contributing to Loom

Thanks for helping improve Loom.

## Prerequisites

- Node.js >= 22.14 (Node 24 recommended)
- Corepack enabled (`corepack enable`)
- pnpm 10.12.1 (via `packageManager` field)

## Setup

```bash
corepack enable
pnpm install
```

## Development

```bash
pnpm dev:demo
pnpm test
pnpm lint
pnpm typecheck
```

Build all publishable packages:

```bash
pnpm build:packages
```

## Demo

```bash
pnpm demo
```

## Changesets

When changing publishable packages, add a changeset:

```bash
pnpm changeset
```

## Package boundaries

- `@loom/core` must not import React, DOM APIs, or adapter libraries.
- Adapter packages depend on `@loom/core` and their peer library only.
- `apps/*` and `examples/*` are private and never published.

## Pull requests

- Keep changes focused.
- Ensure `pnpm check` passes.
- Include tests for behavioral changes in `packages/*`.
