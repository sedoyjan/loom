import { state } from "@loom/core";
import { RuntimeProvider, useExternalSource } from "@loom/react";
import { useMemo } from "react";
import { useRenderCount } from "../useRenderCount.js";

export function DiagnosticsDemo() {
  const renders = useRenderCount();
  const source = useMemo(() => state(0), []);
  const value = useExternalSource(source);

  return (
    <RuntimeProvider>
      <p>Component renders: {renders}</p>
      <p>Value: {value}</p>
      <button
        type="button"
        onClick={() => {
          source.set(value + 1);
        }}
      >
        Increment
      </button>
      <button
        type="button"
        onClick={() => {
          source.set(value);
        }}
      >
        Set same value (should not re-render)
      </button>
      <p className="meta">
        Granular property tracking is not implemented yet; updates follow whole-source
        subscriptions via <code>useExternalSource</code>.
      </p>
    </RuntimeProvider>
  );
}
