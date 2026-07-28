import { zustandSource } from "@loom/zustand";
import { RuntimeProvider, useExternalSource } from "@loom/react";
import { createStore } from "zustand/vanilla";
import { useMemo } from "react";

export function ZustandDemo() {
  const store = useMemo(
    () =>
      createStore<{ user: string; visits: number }>((_set) => ({
        user: "Guest",
        visits: 0,
      })),
    [],
  );

  const userSource = useMemo(() => zustandSource(store, (s) => s.user), [store]);
  const user = useExternalSource(userSource);

  return (
    <RuntimeProvider>
      <p>Selected user: {user}</p>
      <button
        type="button"
        onClick={() => {
          store.setState((state) => ({
            user: state.user === "Guest" ? "Member" : "Guest",
            visits: state.visits + 1,
          }));
        }}
      >
        Toggle user
      </button>
      <button
        type="button"
        onClick={() => {
          store.setState((state) => ({
            ...state,
            visits: state.visits + 1,
          }));
        }}
      >
        Bump visits only (selector should not re-render)
      </button>
    </RuntimeProvider>
  );
}
