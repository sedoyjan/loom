# Adapters

Adapters expose third-party stores and observers as `ReadableSource` values compatible with `@loom-mvvm/core` and `@loom-mvvm/react`.

They **do not** replace the underlying library.

## Contract

Each adapter:

1. Reads snapshots via the native API (`getState`, observer result, etc.).
2. Subscribes to native change notifications.
3. Disposes native subscriptions on `dispose()`.

## Packages

| Package                     | Peer                   | Entry points                                    |
| --------------------------- | ---------------------- | ----------------------------------------------- |
| `@loom-mvvm/tanstack-query` | `@tanstack/query-core` | `tanstackQuerySource`, `tanstackMutationSource` |
| `@loom-mvvm/zustand`        | `zustand`              | `zustandSource`                                 |
| `@loom-mvvm/redux`          | `redux`                | `reduxSource`                                   |
| `@loom-mvvm/rxjs`           | `rxjs`                 | `rxjsSource`, `behaviorSubjectSource`           |

Selectors and custom equality functions prevent unnecessary notifications.
