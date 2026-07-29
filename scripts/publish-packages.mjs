#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { loadPublishEnv, resolveNpmAuthToken } from "./npm-auth-env.mjs";

const root = process.cwd();
loadPublishEnv(root);

const token = resolveNpmAuthToken();
if (!token) {
  console.error(`
publish: missing npm token.

Create a granular access token at https://www.npmjs.com/settings/~tokens
(Publish packages, scope: @loom-mvvm / org loom-mvvm), then either:

  export NODE_AUTH_TOKEN=npm_...
  pnpm publish:packages

Or put NODE_AUTH_TOKEN in a local .env file (see .env.example). Never commit tokens.
`);
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_AUTH_TOKEN: token,
  NPM_TOKEN: token,
};

const otp = (process.env.NPM_OTP ?? process.env.npm_config_otp ?? "").trim();
if (otp) {
  env.npm_config_otp = otp;
}

const access = spawnSync("node", ["./scripts/verify-npm-publish-access.mjs"], {
  stdio: "inherit",
  cwd: root,
  env,
});
if (access.status !== 0) {
  process.exit(access.status ?? 1);
}

console.log("publish: using NODE_AUTH_TOKEN for registry.npmjs.org");

const result = spawnSync("pnpm", ["exec", "changeset", "publish"], {
  stdio: "inherit",
  env,
  cwd: root,
});

if (result.status !== 0) {
  process.stderr.write(`
Publish failed. See docs/releases.md (token permissions, @loom-mvvm org, NPM_OTP if 2FA).
`);
  process.exit(result.status ?? 1);
}
