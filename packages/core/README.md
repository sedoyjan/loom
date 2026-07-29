# @loom-mvvm/core

Framework-independent reactive and ViewModel runtime for [Loom](https://github.com/sedoyjan/loom).

## Install

```bash
npm install @loom-mvvm/core
```

## Usage

```ts
import { action, computed, defineViewModel, state } from "@loom-mvvm/core";

export const CounterViewModel = defineViewModel(() => {
  const count = state(0);
  const doubled = computed(() => count.get() * 2);
  const increment = action(() => count.set(count.get() + 1));
  return { count, doubled, increment, dispose: () => count.dispose() };
});
```

## Status

Experimental — APIs may change.
