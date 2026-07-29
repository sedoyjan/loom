import { behaviorSubjectSource, rxjsSource } from "@loom-mvvm/rxjs";
import { RuntimeProvider, useExternalSource } from "@loom-mvvm/react";
import { BehaviorSubject, interval, map, take } from "rxjs";
import { useEffect, useMemo } from "react";

export function RxJsDemo() {
  const subject = useMemo(() => new BehaviorSubject(1), []);
  const behaviorSource = useMemo(() => behaviorSubjectSource(subject), [subject]);
  const behaviorValue = useExternalSource(behaviorSource);

  const tickSource = useMemo(
    () =>
      rxjsSource(
        interval(500).pipe(
          map((n) => n + 1),
          take(6),
        ),
        { initialValue: 0 },
      ),
    [],
  );

  useEffect(
    () => () => {
      tickSource.dispose();
    },
    [tickSource],
  );

  const tick = useExternalSource(tickSource);

  return (
    <RuntimeProvider>
      <p>BehaviorSubject: {behaviorValue}</p>
      <button
        type="button"
        onClick={() => {
          subject.next(subject.getValue() + 1);
        }}
      >
        Emit
      </button>
      <p>Observable ticks: {tick}</p>
    </RuntimeProvider>
  );
}
