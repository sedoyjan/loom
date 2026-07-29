import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createRuntime, type LoomRuntime } from "@loom-mvvm/core";

const RuntimeContext = createContext<LoomRuntime | null>(null);

export interface RuntimeProviderProps {
  children: ReactNode;
  runtime?: LoomRuntime;
}

export function RuntimeProvider({
  children,
  runtime,
}: RuntimeProviderProps): ReactNode {
  const value = useMemo(() => runtime ?? createRuntime(), [runtime]);
  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useLoomRuntime(): LoomRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    return createRuntime();
  }
  return runtime;
}
