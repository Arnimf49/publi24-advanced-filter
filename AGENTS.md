# Copilot Instructions

## Module exports
All public functions in a module must be exported through a single named object whose name matches the filename (camelCase). No bare `export function` / `export const` for individual functions.

Example — `userId.ts`:
```ts
export const userId = {
  init() { ... },
  get() { ... },
};
```

## Verifying changes
After making code changes, only run a TypeScript typecheck — do **not** run `npm run build`:
```
npx tsc --noEmit
```
