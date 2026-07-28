import { createStore } from "zustand/vanilla";
import { describe, expect, it, vi } from "vitest";
import { zustandSource } from "../src/index.js";

describe("zustandSource", () => {
  it("tracks selector updates", () => {
    const store = createStore<{ user: string; other: number }>((_set) => ({
      user: "a",
      other: 0,
    }));
    const source = zustandSource(store, (s) => s.user);
    expect(source.getSnapshot()).toBe("a");
    const listener = vi.fn();
    source.subscribe(listener);
    store.setState({ user: "b", other: 1 });
    expect(listener).toHaveBeenCalled();
    expect(source.getSnapshot()).toBe("b");
    store.setState({ user: "b", other: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
