import { describe, expect, it, vi } from "vitest";
import { action, batch, computed, externalSource, state } from "../src/index.js";

describe("state", () => {
  it("returns initial value", () => {
    expect(state(1).get()).toBe(1);
  });

  it("notifies subscribers", () => {
    const s = state(0);
    const listener = vi.fn();
    s.subscribe(listener);
    s.set(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not notify for equal values", () => {
    const s = state(1);
    const listener = vi.fn();
    s.subscribe(listener);
    s.set(1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribes", () => {
    const s = state(0);
    const listener = vi.fn();
    const unsub = s.subscribe(listener);
    unsub();
    s.set(1);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("batch", () => {
  it("emits one logical update", () => {
    const s = state(0);
    const listener = vi.fn();
    s.subscribe(listener);
    batch(() => {
      s.set(1);
      s.set(2);
    });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(s.get()).toBe(2);
  });

  it("supports nested batch", () => {
    const s = state(0);
    const listener = vi.fn();
    s.subscribe(listener);
    batch(() => {
      s.set(1);
      batch(() => {
        s.set(2);
      });
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not leave broken state when inner fn throws", () => {
    const s = state(0);
    expect(() =>
      batch(() => {
        s.set(1);
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(s.get()).toBe(1);
  });
});

describe("action", () => {
  it("batches synchronous updates", () => {
    const a = state(0);
    const b = state(0);
    const listener = vi.fn();
    a.subscribe(listener);
    const run = action(() => {
      a.set(1);
      b.set(2);
    });
    run();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("computed", () => {
  it("derives from dependencies", () => {
    const count = state(2);
    const doubled = computed(() => count.get() * 2);
    expect(doubled.get()).toBe(4);
    count.set(3);
    expect(doubled.get()).toBe(6);
  });

  it("rebinds dependencies after short-circuit evaluation", () => {
    const password = state("");
    const confirm = state("");
    const isValid = computed(
      () => password.get().length >= 3 && password.get() === confirm.get(),
    );
    expect(isValid.get()).toBe(false);
    password.set("1111");
    expect(isValid.get()).toBe(false);
    confirm.set("1111");
    expect(isValid.get()).toBe(true);
  });
});

describe("externalSource", () => {
  it("adapts external subscribe contract", () => {
    let value = 1;
    const listeners = new Set<() => void>();
    const source = externalSource({
      getSnapshot: () => value,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    });
    const listener = vi.fn();
    source.subscribe(listener);
    value = 2;
    for (const l of listeners) l();
    expect(listener).toHaveBeenCalled();
    expect(source.getSnapshot()).toBe(2);
  });
});
