import { legacy_createStore as createStore } from "redux";
import { describe, expect, it, vi } from "vitest";
import { reduxSource } from "../src/index.js";

describe("reduxSource", () => {
  it("tracks selector updates", () => {
    const store = createStore((state: { auth: string } = { auth: "guest" }, action) => {
      if (action.type === "login") return { auth: "user" };
      return state;
    });
    const source = reduxSource(store, (s) => s.auth);
    const listener = vi.fn();
    source.subscribe(listener);
    store.dispatch({ type: "login" });
    expect(listener).toHaveBeenCalled();
    expect(source.getSnapshot()).toBe("user");
  });
});
