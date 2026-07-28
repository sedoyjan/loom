import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const forbidden = ["react", "react-dom", "react-native", "zustand", "redux", "rxjs"];

describe("core package boundaries", () => {
  it("does not import forbidden modules", () => {
    const srcDir = join(import.meta.dirname, "..", "src");
    const files = readdirSync(srcDir).filter((f) => f.endsWith(".ts"));
    const hits: string[] = [];
    for (const file of files) {
      const content = readFileSync(join(srcDir, file), "utf8");
      for (const mod of forbidden) {
        if (new RegExp(`from ["']${mod}["']`).test(content)) {
          hits.push(`${file} -> ${mod}`);
        }
      }
      if (/@tanstack\//.test(content)) {
        hits.push(`${file} -> @tanstack/*`);
      }
    }
    expect(hits).toEqual([]);
  });
});
