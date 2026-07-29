#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packagesDir = join(root, "packages");

function run(cmd, options = {}) {
  return execSync(cmd, { encoding: "utf8", cwd: root, ...options }).trim();
}

function listPublishablePackages() {
  const names = [];
  for (const dir of readdirSync(packagesDir)) {
    const pkgDir = join(packagesDir, dir);
    if (!statSync(pkgDir).isDirectory()) continue;
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    if (pkg.private) continue;
    names.push({ name: pkg.name, dir: pkgDir, version: pkg.version });
  }
  return names;
}

console.log("ensure-publish-ready: checking built artifacts...");
for (const pkg of listPublishablePackages()) {
  const distJs = join(pkg.dir, "dist", "index.js");
  const distTypes = join(pkg.dir, "dist", "index.d.ts");
  if (!existsSync(distJs) || !existsSync(distTypes)) {
    console.error(
      `ensure-publish-ready: ${pkg.name} is missing dist/. Run pnpm build:packages first.`,
    );
    process.exit(1);
  }
}

let whoami = "";
try {
  whoami = run("npm whoami");
  console.log(`ensure-publish-ready: npm user ${whoami}`);
} catch {
  console.error(
    "ensure-publish-ready: not logged in to npm. Run `npm login` or use CI Trusted Publishing.",
  );
  process.exit(1);
}

const scopePackage = "@loom/core";
let scopePublished = false;
try {
  run(`npm view ${scopePackage} version`);
  scopePublished = true;
} catch {
  scopePublished = false;
}

if (!scopePublished) {
  const ci = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
  const allowFirst = process.env.LOOM_ALLOW_FIRST_PUBLISH === "1";
  if (!ci && !allowFirst) {
    console.error(`
ensure-publish-ready: ${scopePackage} is not on npm yet (404).

First-time publish for the @loom scope:
  1. Create the npm org/user scope "loom" at https://www.npmjs.com/
  2. Ensure your account can publish to @loom (org member with publish rights)
  3. Version packages: pnpm changeset && pnpm version-packages
  4. Run: LOOM_ALLOW_FIRST_PUBLISH=1 pnpm release

See docs/releases.md for Trusted Publishing after the first publish.
`);
    process.exit(1);
  }
  console.log("ensure-publish-ready: first publish (no existing @loom/core on npm)");
}

console.log("ensure-publish-ready: ok");
