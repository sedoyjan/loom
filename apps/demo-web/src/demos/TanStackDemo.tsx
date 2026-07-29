import { QueryClient } from "@tanstack/query-core";
import { tanstackQuerySource } from "@loom-mvvm/tanstack-query";
import { RuntimeProvider, useExternalSource } from "@loom-mvvm/react";
import { useMemo } from "react";
import { createDemoApi } from "../api/createDemoApi.js";

const api = createDemoApi({ latency: 350 });

export function TanStackDemo() {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
      }),
    [],
  );

  const source = useMemo(
    () =>
      tanstackQuerySource(client, {
        queryKey: ["profile"],
        queryFn: ({ signal }) => api.getProfile(signal),
      }),
    [client],
  );

  const data = useExternalSource(source);

  return (
    <RuntimeProvider>
      <p>Profile: {data ? data.name : "Loading…"}</p>
      <button
        type="button"
        onClick={() => void client.invalidateQueries({ queryKey: ["profile"] })}
      >
        Refetch
      </button>
      <button
        type="button"
        onClick={() => {
          api.setFailNextRequest(true);
          void client.invalidateQueries({ queryKey: ["profile"] });
        }}
      >
        Fail next request
      </button>
    </RuntimeProvider>
  );
}
