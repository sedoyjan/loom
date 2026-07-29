import type { ComponentType, ReactNode } from "react";
import type { Disposable } from "@loom-mvvm/core";
import { useViewModel, type ViewModelFactory } from "./useViewModel.js";

export function view<T extends Disposable>(
  factory: ViewModelFactory<T>,
  render: (props: { vm: T }) => ReactNode,
): ComponentType {
  function ViewBound() {
    const vm = useViewModel(factory);
    return render({ vm });
  }
  ViewBound.displayName = "LoomView";
  return ViewBound;
}
