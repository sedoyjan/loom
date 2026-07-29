# @loom-mvvm/react

React and React Native bindings for `@loom-mvvm/core`.

## Peer dependencies

- `react`
- `@loom-mvvm/core`

## Usage

```tsx
import { useExternalSource, view } from "@loom-mvvm/react";
import { CounterViewModel } from "./counter.vm";

export const Counter = view(CounterViewModel, ({ vm }) => {
  const count = useExternalSource(vm.count);
  return <button onClick={vm.increment}>{count}</button>;
});
```

`@loom-mvvm/react` does not import `react-dom` and is intended for React DOM and React Native.

## Status

Experimental — granular Proxy tracking is not implemented yet.
