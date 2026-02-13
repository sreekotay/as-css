# as-css Runtime Internals

This note explains how `as-css` processes style blocks at runtime.

## Lifecycle

1. A `MutationObserver` watches for:
   - `<style as-css>`
   - `<as-style>`
   - `[as-class]` references
2. New style blocks are processed in a microtask flush.
3. A unique scope class is assigned (for example `as--12`).
4. The scope class is added to the style's parent element.
5. CSS rules are rewritten via CSSOM and written back.

## Named Style Flow

- Definitions use `as-name`.
- Definitions are hoisted to `<head>` and deduplicated.
- References use `as-class` and receive the definition scope classes.
- If a named definition has `strong`, references inherit the strong class behavior.

## Strong Flow

- `strong` adds `as-strong` to the target scoped element.
- Selector rewriting uses `.scope.as-strong ...` for stronger specificity.

## Dynamic Flow

`dynamic` is uncommon in most apps, but supported for JS-driven stylesheet/rule mutation.

- A secondary observer watches dynamic stylesheet text/rule changes.
- `as.css.replace()` re-runs scoping for updated text.
- Rapid updates use generation + retry guards so stale retries do not overwrite new styles.

Note: this is not about common inline style updates (`el.style.*`), which do not need dynamic processing.

## Retry and Generation Guards

When a stylesheet is not ready immediately (`styleEl.sheet` is unavailable):

- Retries are bounded.
- Pending retries are canceled for newer generations.
- Old generation callbacks exit without applying stale CSS.

This keeps dynamic usage safe under bursty update patterns.
