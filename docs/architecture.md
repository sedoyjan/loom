# Architecture

Loom separates UI rendering from application logic using a framework-independent reactive runtime.

## Layers

- **View** — React (or React Native) components bound through `@loom-mvvm/react`.
- **ViewModel** — Reactive state and commands composed with `@loom-mvvm/core` primitives.
- **Services** — Application and infrastructure code invoked by ViewModels.
- **External adapters** — Bridges to TanStack Query, Zustand, Redux, and RxJS without re-implementing those libraries.

## Dependency direction

```text
View → @loom-mvvm/react → @loom-mvvm/core ← adapter packages → external libraries
```

`@loom-mvvm/core` never imports renderer or adapter packages.

## Runtime scope

`createRuntime()` and `RuntimeProvider` support request-scoped disposal of external sources. ViewModels should expose explicit `dispose()` for owned reactive nodes.

See also [reactivity.md](./reactivity.md) and [adapters.md](./adapters.md).
