import type { Disposable, ReadableSource } from "./types.js";

export interface ExternalSourceOptions<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
}

export function externalSource<T>(
  options: ExternalSourceOptions<T>,
): ReadableSource<T> & Disposable {
  let disposed = false;

  return {
    getSnapshot(): T {
      return options.getSnapshot();
    },
    subscribe(listener: () => void): () => void {
      if (disposed) {
        return () => undefined;
      }
      return options.subscribe(listener);
    },
    dispose(): void {
      disposed = true;
    },
  };
}
