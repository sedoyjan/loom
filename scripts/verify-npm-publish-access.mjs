#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const scopeOrg = "loom";
const probePackageDir = join(root, "packages", "core");

function run(cmd, options = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
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
  console.error("verify-npm-publish-access: not logged in. Run `npm login` first.");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(probePackageDir, "package.json"), "utf8"));
const packageName = pkg.name;
const scope = packageName.split("/")[0] ?? "";

if (scope !== `@${scopeOrg}`) {
  console.log(`verify-npm-publish-access: skip (probe package ${packageName} is not @${scopeOrg})`);
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
  console.log(`verify-npm-publish-access: ok (${whoami} is in npm org "${scopeOrg}")`);
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

Logged-in publish to @${scopeOrg}/* needs membership in the npm org "${scopeOrg}".
A failed publish often shows E404 even when the real issue is scope access.

Fix:
  1. Create the org: https://www.npmjs.com/org/create  (name: ${scopeOrg})
     — if the name is taken, you need an invite from the owner or pick another scope.
  2. After you are added: npm org ls ${scopeOrg}  must list "${whoami}".
  3. Retry: pnpm publish:packages

Alternative: rename packages to @${whoami}/… (see README → Renaming the project).
`);
process.exit(1);
