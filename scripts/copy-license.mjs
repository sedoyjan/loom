import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const target = process.cwd();

const license = join(root, "LICENSE");
if (existsSync(license)) {
  copyFileSync(license, join(target, "LICENSE"));
}
