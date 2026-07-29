#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** @param {string} root */
export function loadPublishEnv(root) {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) {
    return;
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (key !== "NODE_AUTH_TOKEN" && key !== "NPM_TOKEN" && key !== "NPM_OTP") {
      continue;
    }
    if (process.env[key]) {
      continue;
    }
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/** @returns {string} */
export function resolveNpmAuthToken() {
  return (process.env.NODE_AUTH_TOKEN ?? process.env.NPM_TOKEN ?? "").trim();
}
