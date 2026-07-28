"use client";

import { action, defineViewModel, state } from "@loom/core";
import { useExternalSource, view } from "@loom/react";

const CounterViewModel = defineViewModel(() => {
  const count = state(0);
  const increment = action(() => {
    count.set(count.get() + 1);
  });
  return {
    count,
    increment,
    dispose() {
      count.dispose();
    },
  };
});

const Counter = view(CounterViewModel, ({ vm }) => {
  const value = useExternalSource(vm.count);
  return (
    <main>
      <h1>Loom + Next.js</h1>
      <p>
        Client component counter: {value}{" "}
        <button type="button" onClick={vm.increment}>
          +
        </button>
      </p>
      <p>
        SSR/hydration for ViewModels is experimental; create per-request instances in
        client components.
      </p>
    </main>
  );
});

export default function Page() {
  return <Counter />;
}
