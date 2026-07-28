import type { Store } from "redux";
import { externalSource, type ReadableSource } from "@loom/core";
import type { Disposable } from "@loom/core";

export function reduxSource<TState, TSelected>(
  store: Store<TState>,
  selector: (state: TState) => TSelected = (state) => state as unknown as TSelected,
  equals: (a: TSelected, b: TSelected) => boolean = Object.is,
): ReadableSource<TSelected> & Disposable {
  let current = selector(store.getState());

  const source = externalSource({
    getSnapshot: () => current,
    subscribe: (listener) =>
      store.subscribe(() => {
        const next = selector(store.getState());
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
