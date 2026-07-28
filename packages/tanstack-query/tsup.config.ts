import { defineConfig } from "tsup";

const external = ["@loom/core", "@tanstack/query-core"];

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: !process.argv.includes("--watch"),
  external,
  treeshake: true,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
