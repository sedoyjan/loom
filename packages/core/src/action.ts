import { batch } from "./batch.js";

export function action<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  return (...args: TArgs) => batch(() => fn(...args));
}
