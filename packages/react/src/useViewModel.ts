import { useEffect, useRef } from "react";
import type { Disposable } from "@loom-mvvm/core";

export type ViewModelFactory<T extends Disposable> = () => T;

export function useViewModel<T extends Disposable>(factory: ViewModelFactory<T>): T {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;
  const vmRef = useRef<T | null>(null);
  const effectGenerationRef = useRef(0);

  if (!vmRef.current) {
    vmRef.current = factoryRef.current();
  }

  useEffect(() => {
    effectGenerationRef.current += 1;
    const effectGeneration = effectGenerationRef.current;

    return () => {
      const disposeGeneration = effectGeneration;
      queueMicrotask(() => {
        if (effectGenerationRef.current !== disposeGeneration) {
          return;
        }
        vmRef.current?.dispose();
        vmRef.current = null;
      });
    };
  }, []);

  return vmRef.current;
}
