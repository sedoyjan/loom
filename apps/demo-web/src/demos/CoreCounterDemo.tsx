import { action, batch, computed, defineViewModel, state } from "@loom/core";
import { RuntimeProvider, useDecompose, view } from "@loom/react";
import { useRenderCount } from "../useRenderCount.js";

const counterFields = ["count", "doubled"] as const;

const CounterViewModel = defineViewModel(() => {
  const count = state(0);
  const doubled = computed(() => count.get() * 2);
  const increment = action(() => {
    count.set(count.get() + 1);
  });
  const incrementTwiceBatched = action(() => {
    batch(() => {
      count.set(count.get() + 1);
      count.set(count.get() + 1);
    });
  });
  return {
    count,
    doubled,
    increment,
    incrementTwiceBatched,
    dispose() {
      count.dispose();
      doubled.dispose();
    },
  };
});

const CounterView = view(CounterViewModel, ({ vm }) => {
  const renders = useRenderCount();
  const { count, doubled } = useDecompose(vm, counterFields);
  return (
    <div>
      <p>Render count: {renders}</p>
      <p className="meta">
        One render per update when count and doubled change together (Strict Mode adds
        extra dev-only renders).
      </p>
      <p>
        Count: {count} · Doubled: {doubled}
      </p>
      <button type="button" onClick={vm.increment}>
        Increment
      </button>{" "}
      <button type="button" onClick={vm.incrementTwiceBatched}>
        Batch +2
      </button>
    </div>
  );
});

export function CoreCounterDemo() {
  return (
    <RuntimeProvider>
      <CounterView />
    </RuntimeProvider>
  );
}
