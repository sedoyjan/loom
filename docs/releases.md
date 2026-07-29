# Releases

Loom uses [Changesets](https://github.com/changesets/changesets) with **independent** package versions.

## Day-to-day

```bash
pnpm changeset
git add .
git commit -m "chore: add changeset"
```

After merge to `main`, the Release workflow opens or updates a "Version packages" PR. Merging that PR triggers `changeset publish`.

## npm Trusted Publishing

Primary publishing path is **OIDC Trusted Publishing** from `.github/workflows/release.yml` (`id-token: write`).

## Local release

```bash
pnpm check
node ./scripts/ensure-publish-ready.mjs
changeset publish
```

Or `pnpm release` (runs all of the above).

Packages are built during `pnpm check`; `prepack` only verifies `dist/` exists (it does not rebuild, so publish does not break on workspace-only types).

### First publication bootstrap

1. Create the npm scope/org for `@loom`.
2. Add changesets and run `pnpm version-packages` before publishing (avoid shipping unintended `0.0.0` if you prefer a semver start).
3. First publish when nothing exists on npm yet:

```bash
LOOM_ALLOW_FIRST_PUBLISH=1 pnpm release
```

4. For each package, configure Trusted Publisher:
   - Owner: `sedoyjan`
   - Repository: `loom`
   - Workflow: `release.yml`
5. Revoke long-lived write tokens after OIDC works.
6. Verify provenance on npm.

Manual token-based publish is a documented fallback only.

## Prereleases

```bash
pnpm changeset pre enter next
pnpm changeset
pnpm version-packages
pnpm changeset publish
pnpm changeset pre exit
```

## Rollback

npm unpublish is limited; prefer publishing a patch revert. Document breaking changes via changesets.
