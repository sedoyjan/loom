type Listener = () => void;

interface BatchFrame {
  listeners: Set<Listener>;
  depth: number;
}

let batchFrame: BatchFrame | null = null;

export function isBatching(): boolean {
  return batchFrame !== null;
}

export function schedule(listener: Listener): void {
  if (batchFrame) {
    batchFrame.listeners.add(listener);
    return;
  }
  listener();
}

export function batch<T>(fn: () => T): T {
  if (batchFrame) {
    return fn();
  }

  const frame: BatchFrame = { listeners: new Set(), depth: 1 };
  const previous = batchFrame;
  batchFrame = frame;

  try {
    return fn();
  } finally {
    batchFrame = previous;
    const listeners = [...frame.listeners];
    frame.listeners.clear();
    for (const listener of listeners) {
      listener();
    }
  }
}

export function flushBatchForTests(): void {
  if (!batchFrame) return;
  const listeners = [...batchFrame.listeners];
  batchFrame.listeners.clear();
  for (const listener of listeners) {
    listener();
  }
}
