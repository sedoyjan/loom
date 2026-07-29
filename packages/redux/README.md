# @loom-mvvm/redux

Exposes Redux-compatible stores as Loom `ReadableSource` values.

This package does not replace Redux.

```ts
const authSource = reduxSource(store, (state) => state.auth);
```

Status: prototype.
