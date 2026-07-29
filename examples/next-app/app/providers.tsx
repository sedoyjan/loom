"use client";

import { RuntimeProvider } from "@loom-mvvm/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <RuntimeProvider>{children}</RuntimeProvider>;
}
