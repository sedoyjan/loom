#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function resolveOtp() {
  const fromEnv = process.env.NPM_OTP ?? process.env.npm_config_otp;
  if (fromEnv?.trim()) {
    return fromEnv.trim();
  }
  if (!input.isTTY) {
    return "";
  }
  const rl = createInterface({ input, output });
  const answer = await rl.question(
    "npm one-time password (2FA; leave empty if your token bypasses 2FA): ",
  );
  rl.close();
  return answer.trim();
}

function printPublishHelp() {
  process.stderr.write(`
Publish failed. See the output above.

  npm E404 on @loom/*
    Your account does not have publish rights on the @loom scope. Run:
      node ./scripts/verify-npm-publish-access.mjs
    Create the "loom" npm org (or join it), or rename packages to a scope you own.

  npm E403 (2FA)
    NPM_OTP=123456 pnpm publish:packages

See docs/releases.md
`);
}

const otp = await resolveOtp();
const env = { ...process.env };
if (otp) {
  env.npm_config_otp = otp;
}

const access = spawnSync("node", ["./scripts/verify-npm-publish-access.mjs"], {
  stdio: "inherit",
  cwd: process.cwd(),
});
if (access.status !== 0) {
  process.exit(access.status ?? 1);
}

const result = spawnSync("pnpm", ["exec", "changeset", "publish"], {
  stdio: "inherit",
  env,
  cwd: process.cwd(),
});

if (result.status !== 0) {
  printPublishHelp();
  process.exit(result.status ?? 1);
}
