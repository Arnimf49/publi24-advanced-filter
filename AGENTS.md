# Agents Instructions

## Module exports

All public functions in a module must be exported through a single named object whose name matches the filename (camelCase). No bare `export function` / `export const` for individual functions.
Functions that are only used internally within a module and are not part of the public API must **not** be added to the exported object. Keep them as plain module-level functions.

Example — `userId.ts`:
```ts
const getSomething = () => {}
export const userId = {
  init() { getSomething(); ... },
  get() { ... },
};
```

## Error handling

Never silently catch and discard errors. If you catch, either rethrow or log meaningfully. An empty `catch {}` or `catch { /* ignore */ }` is not acceptable.

## Code style

- Always use braces for `if`/`else`/`for`/`while` bodies, even for single-line instructions. No braceless one-liners.
- Within a function, group related statements logically and separate distinct logical parts with a blank line.

## Verifying changes

Only run a TypeScript typecheck if TypeScript files were changed **and** you are unsure whether the change is type-correct. Do **not** run `npm run build`:
```
npx tsc --noEmit
```
