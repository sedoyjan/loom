# Reactivity model

## Primitives

- `state(initial)` — writable cell with `get()`, `set()`, `subscribe`, and `getSnapshot()`.
- `computed(fn)` — derived value tracked via dependency reads during computation.
- `batch(fn)` — coalesces synchronous notifications into one flush.
- `action(fn)` — runs synchronous work inside `batch`.
- `externalSource({ getSnapshot, subscribe })` — adapts foreign subscribe APIs.

## Equality

Updates use `Object.is` by default. Identical assignments do not notify subscribers.

## React rendering

`@loom-mvvm/react` uses `useSyncExternalStore` with `getServerSnapshot` support. Granular per-property Proxy tracking is **not** implemented yet; subscribe per `ReadableSource`.

## Roadmap

Proxy-based auto-unwrapping (`vm.count` instead of `vm.count.get()`) is planned with granular React subscriptions.
