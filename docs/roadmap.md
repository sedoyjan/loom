# Roadmap

## Implemented

- Monorepo scaffold (pnpm, Turborepo, tsup, Vitest, Changesets)
- `@loom/core` primitives (`state`, `computed`, `batch`, `action`, `externalSource`, `defineViewModel`, `createRuntime`)
- `@loom/react` (`useExternalSource`, `useViewModel`, `view`, `observe`, `RuntimeProvider`)
- Adapter packages for TanStack Query, Zustand, Redux, RxJS
- Demo web app and minimal Next.js / Expo examples

## Next

- Proxy-based auto-unwrapping for ViewModel fields
- Granular React subscriptions per accessed property
- SSR/hydration guidance and utilities for Next.js

## Later

- Dedicated SSR utilities package
- Additional renderer adapters

## Non-goals (v1)

- Own query cache
- Own router
- Own form library
- Own HTTP client
- Own Redux replacement
- Own navigation library
