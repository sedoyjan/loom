# Adapters

Adapters expose third-party stores and observers as `ReadableSource` values compatible with `@loom/core` and `@loom/react`.

They **do not** replace the underlying library.

## Contract

Each adapter:

1. Reads snapshots via the native API (`getState`, observer result, etc.).
2. Subscribes to native change notifications.
3. Disposes native subscriptions on `dispose()`.

## Packages

| Package                | Peer                   | Entry points                                    |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| `@loom/tanstack-query` | `@tanstack/query-core` | `tanstackQuerySource`, `tanstackMutationSource` |
| `@loom/zustand`        | `zustand`              | `zustandSource`                                 |
| `@loom/redux`          | `redux`                | `reduxSource`                                   |
| `@loom/rxjs`           | `rxjs`                 | `rxjsSource`, `behaviorSubjectSource`           |

Selectors and custom equality functions prevent unnecessary notifications.
