import { BehaviorSubject, Subject } from "rxjs";
import { describe, expect, it, vi } from "vitest";
import { behaviorSubjectSource, rxjsSource } from "../src/index.js";

describe("rxjs adapters", () => {
  it("reads behavior subject", () => {
    const subject = new BehaviorSubject(1);
    const source = behaviorSubjectSource(subject);
    expect(source.getSnapshot()).toBe(1);
    subject.next(2);
    expect(source.getSnapshot()).toBe(2);
  });

  it("tracks observable emissions", () => {
    const subject = new Subject<number>();
    const source = rxjsSource(subject, { initialValue: 0 });
    const listener = vi.fn();
    source.subscribe(listener);
    subject.next(3);
    expect(listener).toHaveBeenCalled();
    expect(source.getSnapshot()).toBe(3);
    source.dispose();
  });
});
