# @loom/tanstack-query

Adapter between Loom and `@tanstack/query-core`.

This package does not replace TanStack Query or implement a query cache.

```ts
import { tanstackQuerySource } from "@loom/tanstack-query";

const profile = tanstackQuerySource(queryClient, {
  queryKey: ["profile"],
  queryFn: api.getProfile,
});
```

Status: prototype.
