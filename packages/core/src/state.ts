import { schedule } from "./batch.js";
import { trackDependency } from "./tracking.js";
import type { Unsubscribe, WritableSource } from "./types.js";

export interface State<T> extends WritableSource<T> {
  get(): T;
  dispose(): void;
}

export function state<T>(initialValue: T): State<T> {
  let value = initialValue;
  let disposed = false;
  const listeners = new Set<() => void>();

  const flushListeners = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  const notify = () => {
    if (disposed) return;
    schedule(flushListeners);
  };

  const self: State<T> = {
    get(): T {
      trackDependency(self);
      return value;
    },
    getSnapshot(): T {
      return value;
    },
    set(next: T): void {
      if (disposed) return;
      if (Object.is(next, value)) return;
      value = next;
      notify();
    },
    subscribe(listener: () => void): Unsubscribe {
      if (disposed) {
        return () => undefined;
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      listeners.clear();
    },
  };
  return self;
}
