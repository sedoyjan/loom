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

### First publication bootstrap

1. Create the npm scope/org for `@loom`.
2. Perform the first publish manually if npm requires an existing package before Trusted Publisher setup.
3. For each package, configure Trusted Publisher:
   - Owner: `sedoyjan`
   - Repository: `loom`
   - Workflow: `release.yml`
4. Revoke long-lived write tokens after OIDC works.
5. Verify provenance on npm.

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
