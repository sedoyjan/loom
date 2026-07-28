import type { ReactNode } from "react";
import type { ReadableSource } from "@loom/core";
import { useExternalSource } from "./useExternalSource.js";

export interface ObserveProps<T> {
  source: ReadableSource<T>;
  children: (value: T) => ReactNode;
  getServerSnapshot?: () => T;
}

export function observe<T>(props: ObserveProps<T>): ReactNode {
  const value = useExternalSource(props.source, props.getServerSnapshot);
  return props.children(value);
}
