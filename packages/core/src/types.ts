export interface ReadableSource<T> {
  getSnapshot(): T;
  subscribe(listener: () => void): () => void;
}

export interface WritableSource<T> extends ReadableSource<T> {
  set(value: T): void;
}

export interface Disposable {
  dispose(): void;
}

export interface RuntimeAdapter<TExternal, TSnapshot> {
  createSource(external: TExternal): ReadableSource<TSnapshot> & Disposable;
}

export type Unsubscribe = () => void;

export interface ViewModelInstance<T> extends Disposable {
  readonly snapshot: T;
}

export interface LoomRuntime {
  readonly disposed: boolean;
  dispose(): void;
}
