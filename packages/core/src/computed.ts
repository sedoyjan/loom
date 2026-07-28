import { schedule } from "./batch.js";
import { runWithTracking } from "./tracking.js";
import type { ReadableSource } from "./types.js";
import type { Unsubscribe } from "./types.js";

export interface Computed<T> extends ReadableSource<T> {
  get(): T;
  dispose(): void;
}

type ComputedOptions = {
  equals?: (a: unknown, b: unknown) => boolean;
};

export function computed<T>(compute: () => T, options?: ComputedOptions): Computed<T> {
  const equals = options?.equals ?? Object.is;
  const listeners = new Set<() => void>();
  let disposed = false;
  let cached: T;
  let dependencyUnsubs: Unsubscribe[] = [];

  const clearDependencyUnsubs = (): void => {
    for (const unsub of dependencyUnsubs) {
      unsub();
    }
    dependencyUnsubs = [];
  };

  let boundDependencies: Set<ReadableSource<unknown>> | null = null;

  const sameDependencies = (
    next: Set<ReadableSource<unknown>>,
    prev: Set<ReadableSource<unknown>> | null,
  ): boolean => {
    if (!prev || prev.size !== next.size) {
      return false;
    }
    for (const dep of next) {
      if (!prev.has(dep)) {
        return false;
      }
    }
    return true;
  };

  const bindDependencies = (dependencies: Set<ReadableSource<unknown>>): void => {
    if (sameDependencies(dependencies, boundDependencies)) {
      return;
    }
    boundDependencies = new Set(dependencies);
    clearDependencyUnsubs();
    for (const dep of dependencies) {
      dependencyUnsubs.push(dep.subscribe(recompute));
    }
  };

  const recompute = (): void => {
    if (disposed) return;
    const { value, dependencies } = runWithTracking(compute);
    bindDependencies(dependencies);
    if (equals(value, cached)) {
      return;
    }
    cached = value;
    schedule(() => {
      for (const listener of listeners) {
        listener();
      }
    });
  };

  const initial = runWithTracking(compute);
  cached = initial.value;
  bindDependencies(initial.dependencies);

  return {
    get(): T {
      return cached;
    },
    getSnapshot(): T {
      return cached;
    },
    subscribe(listener: () => void): Unsubscribe {
      if (disposed) return () => undefined;
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      listeners.clear();
      clearDependencyUnsubs();
    },
  };
}
