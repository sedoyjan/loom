import { type BehaviorSubject, type Observable } from "rxjs";
import { externalSource, type ReadableSource } from "@loom/core";
import type { Disposable } from "@loom/core";

export type RxjsSourceOptions<T> = {
  initialValue: T;
  onError?: (error: unknown) => void;
  onComplete?: () => void;
};

export function behaviorSubjectSource<T>(
  subject: BehaviorSubject<T>,
): ReadableSource<T> & Disposable {
  const source = externalSource({
    getSnapshot: () => subject.getValue(),
    subscribe: (listener) => {
      const sub = subject.subscribe({
        next: () => {
          listener();
        },
        error: () => {
          listener();
        },
        complete: () => {
          listener();
        },
      });
      return () => {
        sub.unsubscribe();
      };
    },
  });
  return {
    ...source,
    dispose() {
      source.dispose();
    },
  };
}

export function rxjsSource<T>(
  observable: Observable<T>,
  options: RxjsSourceOptions<T>,
): ReadableSource<T> & Disposable {
  let current = options.initialValue;
  let errored = false;
  let completed = false;

  const source = externalSource({
    getSnapshot: () => current,
    subscribe: (listener) => {
      const sub = observable.subscribe({
        next: (value) => {
          current = value;
          listener();
        },
        error: (error) => {
          errored = true;
          options.onError?.(error);
          listener();
        },
        complete: () => {
          completed = true;
          options.onComplete?.();
          listener();
        },
      });
      return () => {
        sub.unsubscribe();
      };
    },
  });

  return {
    getSnapshot: () => {
      if (errored || completed) {
        return current;
      }
      return current;
    },
    subscribe: (listener) => source.subscribe(listener),
    dispose: () => {
      source.dispose();
    },
  };
}
