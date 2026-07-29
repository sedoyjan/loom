#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadPublishEnv, resolveNpmAuthToken } from "./npm-auth-env.mjs";

const root = process.cwd();
loadPublishEnv(root);

const scopeOrg = "loom-mvvm";
const probePackageDir = join(root, "packages", "core");

const token = resolveNpmAuthToken();
const npmEnv = token
  ? { ...process.env, NODE_AUTH_TOKEN: token, NPM_TOKEN: token }
  : { ...process.env };

function run(cmd, options = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: npmEnv,
    ...options,
  });
}

function runAllowFail(cmd, options = {}) {
  try {
    return { ok: true, stdout: run(cmd, options), stderr: "" };
  } catch (error) {
    const err = /** @type {{ stdout?: string; stderr?: string }} */ (error);
    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? String(error),
    };
  }
}

let whoami = "";
try {
  whoami = run("npm whoami").trim();
} catch {
  console.error(
    "verify-npm-publish-access: npm auth failed. Set NODE_AUTH_TOKEN (granular publish token).",
  );
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(probePackageDir, "package.json"), "utf8"));
const packageName = pkg.name;
const scope = packageName.split("/")[0] ?? "";

if (scope !== `@${scopeOrg}`) {
  console.log(
    `verify-npm-publish-access: skip (probe package ${packageName} is not @${scopeOrg})`,
  );
  process.exit(0);
}

const org = runAllowFail(`npm org ls ${scopeOrg} --json`);
let orgMembers = {};
if (org.ok) {
  try {
    orgMembers = JSON.parse(org.stdout.trim() || "{}");
  } catch {
    orgMembers = {};
  }
}

const inLoomOrg = Object.prototype.hasOwnProperty.call(orgMembers, whoami);

if (inLoomOrg) {
  const via = token ? "NODE_AUTH_TOKEN" : "npm auth";
  console.log(
    `verify-npm-publish-access: ok (${whoami}, ${via}, npm org "${scopeOrg}")`,
  );
  process.exit(0);
}

console.error(`
verify-npm-publish-access: ${whoami} cannot publish ${packageName} yet.

npm org "${scopeOrg}" members (npm org ls ${scopeOrg}):
  ${
    Object.keys(orgMembers).length === 0
      ? "(empty — you are not in this organization)"
      : Object.keys(orgMembers).join(", ")
  }

Fix: join npm org "${scopeOrg}" or use a token tied to an account that is an org member.
`);
process.exit(1);
