import { useCallback, useSyncExternalStore } from "react";
import type { ReadableSource } from "@loom/core";

export function useExternalSource<T>(
  source: ReadableSource<T>,
  getServerSnapshot?: () => T,
): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => source.subscribe(onStoreChange),
    [source],
  );
  const getSnapshot = useCallback(() => source.getSnapshot(), [source]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot ?? getSnapshot);
}
