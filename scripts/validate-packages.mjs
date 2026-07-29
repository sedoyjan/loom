#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const packagesDir = join(root, "packages");
const forbiddenPrivate = new Set(["demo-web", "next-app", "expo-app"]);

function fail(message) {
  console.error(`validate-packages: ${message}`);
  process.exit(1);
}

function run(cmd, cwd = root) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] });
}

console.log("validate-packages: ensuring builds...");
execSync("pnpm build:packages", { stdio: "inherit", cwd: root });

const packDir = mkdtempSync(join(tmpdir(), "loom-validate-"));

try {
  for (const dirName of readdirSync(packagesDir)) {
    const pkgRoot = join(packagesDir, dirName);
    if (!statSync(pkgRoot).isDirectory()) continue;

    const manifestPath = join(pkgRoot, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const label = manifest.name ?? dirName;

    if (manifest.private) {
      fail(`${label} must not be private (publishable package)`);
    }

    if (forbiddenPrivate.has(manifest.name)) {
      fail(`${label} is a non-publishable app name in packages/`);
    }

    const expectedName = `@loom-mvvm/${dirName}`;
    if (manifest.name !== expectedName) {
      fail(`${label} name must be ${expectedName}`);
    }

    for (const field of ["license", "repository", "files", "exports", "types"]) {
      if (manifest[field] === undefined) {
        fail(`${label} missing required field: ${field}`);
      }
    }

    if (manifest.repository?.directory !== `packages/${dirName}`) {
      fail(`${label} repository.directory must be packages/${dirName}`);
    }

    if (manifest.publishConfig?.access !== "public") {
      fail(`${label} publishConfig.access must be public`);
    }

    if (!readFileSync(join(pkgRoot, "README.md"), "utf8").trim()) {
      fail(`${label} README.md is empty`);
    }

    const licensePath = join(pkgRoot, "LICENSE");
    try {
      readFileSync(licensePath, "utf8");
    } catch {
      fail(`${label} missing LICENSE (copy from root or build step)`);
    }

    console.log(`validate-packages: packing ${label}...`);
    const packOutput = run(`pnpm pack --pack-destination "${packDir}"`, pkgRoot).trim();
    const tarballLine =
      packOutput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .at(-1) ?? "";
    const tarballName = basename(tarballLine);
    if (!tarballName.endsWith(".tgz")) {
      fail(`${label} pnpm pack did not produce a tarball (got: ${tarballLine})`);
    }
    const tgzPath = join(packDir, tarballName);
    const listing = run(`tar -tzf "${tgzPath}"`);
    const forbiddenPaths = [
      "/test/",
      "/coverage/",
      ".turbo",
      "tsconfig.json",
      "vitest",
    ];
    for (const entry of listing.split("\n")) {
      if (forbiddenPaths.some((f) => entry.includes(f))) {
        fail(`${label} tarball contains forbidden path: ${entry}`);
      }
    }

    if (!listing.includes("package/LICENSE") && !listing.includes("LICENSE")) {
      fail(`${label} tarball missing LICENSE`);
    }

    const packedManifest = JSON.parse(
      run(`tar -xOf "${tgzPath}" package/package.json`),
    );
    const deps = JSON.stringify({
      ...packedManifest.dependencies,
      ...packedManifest.peerDependencies,
    });
    if (deps.includes("workspace:")) {
      fail(`${label} packed manifest still contains workspace: ranges`);
    }

    execSync(`npx publint "${tgzPath}"`, { stdio: "inherit", cwd: root });

    const esmUrl = pathToFileURL(join(pkgRoot, "dist/index.js")).href;
    execSync(`node --input-type=module -e "import('${esmUrl}')"`, {
      stdio: "inherit",
      cwd: root,
    });
    execSync(`node -e "require('${join(pkgRoot, "dist/index.cjs")}')"`, {
      stdio: "inherit",
      cwd: root,
    });
  }
} finally {
  rmSync(packDir, { recursive: true, force: true });
}

for (const app of ["apps/demo-web", "examples/next-app", "examples/expo-app"]) {
  const pkg = JSON.parse(readFileSync(join(root, app, "package.json"), "utf8"));
  if (!pkg.private) {
    fail(`${app} must be private: true`);
  }
}

console.log("validate-packages: all checks passed");
