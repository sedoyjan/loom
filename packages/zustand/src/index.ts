import { externalSource, type ReadableSource } from "@loom/core";
import type { Disposable } from "@loom/core";

export type ZustandStore<TState> = {
  getState: () => TState;
  subscribe: (listener: (state: TState, prevState: TState) => void) => () => void;
};

export function zustandSource<TState, TSelected>(
  store: ZustandStore<TState>,
  selector: (state: TState) => TSelected = (state) => state as unknown as TSelected,
  equals: (a: TSelected, b: TSelected) => boolean = Object.is,
): ReadableSource<TSelected> & Disposable {
  let current = selector(store.getState());

  const source = externalSource({
    getSnapshot: () => current,
    subscribe: (listener) =>
      store.subscribe((state) => {
        const next = selector(state);
        if (equals(next, current)) return;
        current = next;
        listener();
      }),
  });

  return {
    getSnapshot: () => current,
    subscribe: (listener) => source.subscribe(listener),
    dispose: () => {
      source.dispose();
    },
  };
}
