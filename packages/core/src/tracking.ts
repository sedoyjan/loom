import type { ReadableSource } from "./types.js";

let activeTracker: Set<ReadableSource<unknown>> | null = null;

export function trackDependency(source: ReadableSource<unknown>): void {
  activeTracker?.add(source);
}

export function runWithTracking<T>(fn: () => T): {
  value: T;
  dependencies: Set<ReadableSource<unknown>>;
} {
  const dependencies = new Set<ReadableSource<unknown>>();
  const previous = activeTracker;
  activeTracker = dependencies;
  try {
    const value = fn();
    return { value, dependencies };
  } finally {
    activeTracker = previous;
  }
}
