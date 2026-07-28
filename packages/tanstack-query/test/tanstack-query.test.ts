import { QueryClient } from "@tanstack/query-core";
import { describe, expect, it, vi } from "vitest";
import { tanstackQuerySource } from "../src/index.js";

describe("tanstackQuerySource", () => {
  it("returns cached query data without network", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await client.prefetchQuery({
      queryKey: ["profile"],
      queryFn: () => ({ name: "Ada" }),
    });

    const source = tanstackQuerySource(client, {
      queryKey: ["profile"],
      queryFn: () => ({ name: "Ada" }),
    });

    expect(source.getSnapshot()).toEqual({ name: "Ada" });
    const listener = vi.fn();
    source.subscribe(listener);
    await client.invalidateQueries({ queryKey: ["profile"] });
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalled();
    });
    source.dispose();
  });
});
