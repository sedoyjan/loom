import type { Disposable, LoomRuntime, RuntimeAdapter } from "./types.js";

const adapters = new WeakMap<object, Disposable>();

export function createRuntime(): LoomRuntime {
  let disposed = false;
  const owned = new Set<Disposable>();

  const runtime: LoomRuntime = {
    get disposed() {
      return disposed;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const item of owned) {
        item.dispose();
      }
      owned.clear();
    },
  };

  return runtime;
}

export function registerDisposable(runtime: LoomRuntime, disposable: Disposable): void {
  if (runtime.disposed) {
    disposable.dispose();
    return;
  }
  const owned = getOwnedSet(runtime);
  owned.add(disposable);
}

export function adaptExternal<TExternal extends object, TSnapshot>(
  runtime: LoomRuntime,
  adapter: RuntimeAdapter<TExternal, TSnapshot>,
  external: TExternal,
): ReturnType<RuntimeAdapter<TExternal, TSnapshot>["createSource"]> {
  const source = adapter.createSource(external);
  registerDisposable(runtime, source);
  adapters.set(external, source);
  return source;
}

const ownedSets = new WeakMap<LoomRuntime, Set<Disposable>>();

function getOwnedSet(runtime: LoomRuntime): Set<Disposable> {
  let set = ownedSets.get(runtime);
  if (!set) {
    set = new Set();
    ownedSets.set(runtime, set);
  }
  return set;
}
