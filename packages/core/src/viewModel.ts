import type { Disposable, ViewModelInstance } from "./types.js";

export type ViewModelFactory<T extends Disposable> = () => T;

export function defineViewModel<T extends Disposable>(factory: () => T): () => T {
  return factory;
}

export function createViewModelInstance<T extends Disposable>(
  factory: ViewModelFactory<T>,
): ViewModelInstance<T> {
  const instance = factory();
  return {
    get snapshot() {
      return instance;
    },
    dispose() {
      instance.dispose();
    },
  };
}
