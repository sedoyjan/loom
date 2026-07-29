import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ReadableSource } from "@loom-mvvm/core";

type SourceValue<S> = S extends ReadableSource<infer T> ? T : never;

export type ReadableSourceKeys<S extends object> = {
  [K in keyof S & string]: S[K] extends ReadableSource<unknown> ? K : never;
}[keyof S & string];

export type DecomposedSources<
  S extends object,
  K extends readonly ReadableSourceKeys<S>[],
> = {
  [P in K[number]]: SourceValue<S[P]>;
};

function expectReadableSource(value: unknown): ReadableSource<unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    !("subscribe" in value) ||
    !("getSnapshot" in value)
  ) {
    throw new Error("useDecompose: key does not map to a ReadableSource");
  }
  return value as ReadableSource<unknown>;
}

function snapshotsEqual(left: readonly unknown[], right: readonly unknown[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index++) {
    if (!Object.is(left[index], right[index])) {
      return false;
    }
  }
  return true;
}

/**
 * Subscribe to multiple readable fields from a view model (or source map) in one call.
 * Uses a single React store subscription so one logical update tends to produce one render.
 * Pass a stable `as const` tuple for `keys`.
 */
export function useDecompose<
  S extends object,
  const K extends readonly ReadableSourceKeys<S>[],
>(sources: S, keys: K): DecomposedSources<S, K> {
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const cacheRef = useRef<{
    snapshots: unknown[];
    record: DecomposedSources<S, K>;
  } | null>(null);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubs = keysRef.current.map((key) =>
      expectReadableSource(sourcesRef.current[key]).subscribe(onStoreChange),
    );
    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  }, []);

  const getSnapshot = useCallback((): DecomposedSources<S, K> => {
    const activeKeys = keysRef.current;
    const snapshots = activeKeys.map((key) =>
      expectReadableSource(sourcesRef.current[key]).getSnapshot(),
    );
    const cached = cacheRef.current;
    if (cached && snapshotsEqual(snapshots, cached.snapshots)) {
      return cached.record;
    }
    const record = {} as DecomposedSources<S, K>;
    for (let index = 0; index < activeKeys.length; index++) {
      const key = activeKeys[index] as K[number];
      record[key] = snapshots[index] as DecomposedSources<S, K>[typeof key];
    }
    cacheRef.current = { snapshots, record };
    return record;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
