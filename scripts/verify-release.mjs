#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const packagesDir = join(root, "packages");

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

console.log("verify-release: building packages...");
run("pnpm build:packages");

console.log("verify-release: typecheck...");
run("pnpm typecheck");

console.log("verify-release: tests...");
run("pnpm test");

const privateNames = new Set(["demo-web", "next-app", "expo-app"]);
const { readdirSync, statSync } = await import("node:fs");
const packDir = mkdtempSync(join(tmpdir(), "loom-pack-"));

try {
  for (const name of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, name);
    if (!statSync(pkgPath).isDirectory()) continue;
    const pkgJson = JSON.parse(readFileSync(join(pkgPath, "package.json"), "utf8"));
    if (pkgJson.private) continue;
    if (privateNames.has(pkgJson.name?.replace("@loom-mvvm/", ""))) continue;

    console.log(`\nverify-release: packing ${pkgJson.name}...`);
    const packOutput = execSync(`pnpm pack --pack-destination "${packDir}"`, {
      cwd: pkgPath,
      encoding: "utf8",
    }).trim();
    const tarballName = basename(packOutput.split("\n").filter(Boolean).at(-1) ?? "");
    const tgzPath = join(packDir, tarballName);
    console.log(`  tarball: ${tgzPath}`);

    run(`tar -tzf "${tgzPath}" | head -30`);
    run(`npx publint "${tgzPath}"`);
    const esmUrl = pathToFileURL(join(pkgPath, "dist/index.js")).href;
    execSync(`node --input-type=module -e "import('${esmUrl}')"`, { cwd: root });
    execSync(`node -e "require('${join(pkgPath, "dist/index.cjs")}')"`, { cwd: root });
  }
} finally {
  rmSync(packDir, { recursive: true, force: true });
}

console.log("\nverify-release: complete (nothing published)");
