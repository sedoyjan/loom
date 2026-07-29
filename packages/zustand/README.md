# @loom-mvvm/zustand

Exposes Zustand vanilla stores as Loom `ReadableSource` values.

This package does not replace Zustand.

```ts
const userSource = zustandSource(store, (state) => state.user);
```

Status: prototype.
