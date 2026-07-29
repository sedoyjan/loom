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

## Local publish

```bash
pnpm version-packages   # after changesets are merged or on a release branch
npm login               # once per machine (or use NODE_AUTH_TOKEN in ~/.npmrc)
pnpm release
```

`pnpm release` runs `pnpm check`, then `pnpm publish:packages` (`changeset publish`).

If npm returns **E403** and mentions two-factor authentication, your account (or org) still requires an OTP or a granular token with bypass 2FA:

```bash
NPM_OTP=123456 pnpm publish:packages
```

Packages are built during `pnpm check`; `prepack` only verifies `dist/` exists (it does not rebuild, so publish does not break on workspace-only types).

Use `pnpm release:dry-run` to validate tarballs without publishing.

### First publication bootstrap

1. **Own the `@loom` scope on npm** (org name `loom`):
   - [Create an organization](https://www.npmjs.com/org/create) named `loom` if the name is free, **or**
   - Accept an invite from whoever already owns the `@loom` org.
   - Confirm: `npm org ls loom` should list your username.
2. Run `node ./scripts/verify-npm-publish-access.mjs` — must pass before `pnpm publish:packages`.
3. Add changesets and run `pnpm version-packages` before publishing.
4. `npm login`, then `pnpm release` (or `pnpm publish:packages` after `pnpm check`).

If `@loom` is not available to your account, use another scope and rename packages (see README **Renaming the project**). Your user scope `@sedoyjan` can publish without a separate org.

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
