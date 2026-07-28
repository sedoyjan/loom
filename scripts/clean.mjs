import { rm } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "node:fs/promises";

const roots = ["packages", "apps", "examples"];

const targets = ["dist", "coverage", ".turbo"];

for (const root of roots) {
  for (const target of targets) {
    for await (const dir of glob(join(root, "**", target))) {
      await rm(dir, { recursive: true, force: true });
      console.log(`removed ${dir}`);
    }
  }
}

for await (const file of glob("**/*.tgz", { cwd: process.cwd() })) {
  await rm(file, { force: true });
  console.log(`removed ${file}`);
}

console.log("clean complete");
