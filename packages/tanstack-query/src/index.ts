import {
  MutationObserver,
  QueryObserver,
  type MutationObserverOptions,
  type QueryClient,
  type QueryKey,
  type QueryObserverOptions,
} from "@tanstack/query-core";
import { externalSource, type ReadableSource } from "@loom-mvvm/core";
import type { Disposable } from "@loom-mvvm/core";

export function tanstackQuerySource<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  client: QueryClient,
  options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
): ReadableSource<TData | undefined> & Disposable {
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => undefined);

  const source = externalSource({
    getSnapshot: () => observer.getCurrentResult().data,
    subscribe: (listener) =>
      observer.subscribe(() => {
        listener();
      }),
  });

  return {
    ...source,
    dispose() {
      unsubscribe();
      observer.destroy();
      source.dispose();
    },
  };
}

export function tanstackMutationSource<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  client: QueryClient,
  options: MutationObserverOptions<TData, TError, TVariables, TContext>,
): ReadableSource<
  ReturnType<MutationObserver<TData, TError, TVariables, TContext>["getCurrentResult"]>
> &
  Disposable {
  const observer = new MutationObserver(client, options);
  let mutationUnsubscribe: (() => void) | undefined;

  const source = externalSource({
    getSnapshot: () => observer.getCurrentResult(),
    subscribe: (listener) => {
      mutationUnsubscribe = observer.subscribe(() => {
        listener();
      });
      return () => {
        mutationUnsubscribe?.();
        mutationUnsubscribe = undefined;
      };
    },
  });

  return {
    ...source,
    dispose() {
      mutationUnsubscribe?.();
      source.dispose();
    },
  };
}
