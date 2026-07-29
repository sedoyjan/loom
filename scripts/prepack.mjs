#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";

const distMain = join(process.cwd(), "dist", "index.js");
const distTypes = join(process.cwd(), "dist", "index.d.ts");

if (!existsSync(distMain) || !existsSync(distTypes)) {
  console.error(
    "prepack: dist/ is missing. Run `pnpm build:packages` from the repo root before packing or publishing.",
  );
  process.exit(1);
}
