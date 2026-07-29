# Releases

Loom uses [Changesets](https://github.com/changesets/changesets) with **independent** package versions.

## Day-to-day

```bash
pnpm changeset
git add .
git commit -m "chore: add changeset"
```

When you are ready to ship, run `pnpm version-packages` on a branch, merge, then publish (see below).

The GitHub Release workflow (`.github/workflows/release.yml`) is **disabled** until npm Trusted Publishing is configured.

## Publish with an npm token

Publishing uses a **granular access token** via `NODE_AUTH_TOKEN` (not `npm login`).

1. [Create a token](https://www.npmjs.com/settings/~tokens) → **Granular Access Token**
   - Permissions: **Read and write** → **Publish** packages
   - Packages: **All packages** or limit to org **loom-mvvm** / scope `@loom-mvvm`
   - If your account uses 2FA for publishes, enable **bypass 2FA** on the token (or pass `NPM_OTP` when publishing)
2. Set the token locally (never commit it):

```bash
cp .env.example .env
# edit .env → NODE_AUTH_TOKEN=npm_...
```

Or one-shot:

```bash
export NODE_AUTH_TOKEN=npm_...
```

3. Verify and publish:

```bash
node ./scripts/verify-npm-publish-access.mjs
pnpm version-packages   # when versions are ready
pnpm release            # or: pnpm publish:packages after pnpm check
```

Root `.npmrc` maps `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` so `changeset publish` authenticates correctly.

If npm returns **E403** with 2FA wording: `NPM_OTP=123456 pnpm publish:packages`

Packages are built during `pnpm check`; `prepack` only verifies `dist/` exists.

Use `pnpm release:dry-run` to validate tarballs without publishing.

### First publication bootstrap

1. npm org **loom-mvvm** with your user as owner (`npm org ls loom-mvvm`).
2. `node ./scripts/verify-npm-publish-access.mjs` with `NODE_AUTH_TOKEN` set.
3. `pnpm version-packages`, then `pnpm publish:packages`.

## Prereleases

```bash
pnpm changeset pre enter next
pnpm changeset
pnpm version-packages
NODE_AUTH_TOKEN=npm_... pnpm publish:packages
pnpm changeset pre exit
```

## Rollback

npm unpublish is limited; prefer publishing a patch revert. Document breaking changes via changesets.
