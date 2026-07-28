#!/usr/bin/env node
const FORBIDDEN = ["PROJECT_NAME", "NPM_SCOPE", "GITHUB_OWNER", "GITHUB_REPOSITORY"];

const { readFileSync, readdirSync, statSync } = await import("node:fs");
const { join } = await import("node:path");

/** @param {string} dir */
function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (
      entry === "node_modules" ||
      entry === "dist" ||
      entry === ".git" ||
      entry === ".turbo"
    ) {
      continue;
    }
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if (/\.(md|json|yml|yaml|ts|tsx|js|mjs|cjs)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const root = process.cwd();
const hits = [];

for (const file of walk(root)) {
  const text = readFileSync(file, "utf8");
  for (const token of FORBIDDEN) {
    if (text.includes(token)) {
      hits.push({ file, token });
    }
  }
}

if (hits.length > 0) {
  console.error("Placeholder tokens found (replace before first publish):");
  for (const { file, token } of hits) {
    console.error(`  ${token} in ${file}`);
  }
  process.exit(1);
}

console.log("check:placeholders passed");
