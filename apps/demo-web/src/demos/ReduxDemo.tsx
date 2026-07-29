import { reduxSource } from "@loom-mvvm/redux";
import { RuntimeProvider, useExternalSource } from "@loom-mvvm/react";
import { legacy_createStore as createStore } from "redux";
import { useMemo } from "react";

type State = { auth: string };

export function ReduxDemo() {
  const store = useMemo(
    () =>
      createStore((state: State = { auth: "guest" }, action: { type: string }) => {
        if (action.type === "login") return { auth: "member" };
        return state;
      }),
    [],
  );

  const authSource = useMemo(() => reduxSource(store, (s) => s.auth), [store]);
  const auth = useExternalSource(authSource);

  return (
    <RuntimeProvider>
      <p>Auth: {auth}</p>
      <button type="button" onClick={() => store.dispatch({ type: "login" })}>
        Dispatch login
      </button>
    </RuntimeProvider>
  );
}
