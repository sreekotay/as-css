# as-css Selector/Rewriter Notes

This document summarizes selector rewrite behavior and edge semantics.

## Base Scoping Rule

Rules without explicit container markers are descendant-scoped:

- `.title` -> `.scope .title`
- `:hover` -> `.scope :hover`

## Container Markers

Use `&` or `*` to target the container explicitly:

- `&` -> `.scope`
- `&:hover` -> `.scope:hover`
- `.parent &` -> `.parent .scope`
- `.layout *` -> `.layout .scope`

## Pseudo-elements

Container pseudo-elements attach directly:

- `::before` -> `.scope::before`
- `::after` -> `.scope::after`

## Breakpoint Expansion

Shorthand tokens are expanded before rule rewriting:

- `@media sm-lt` -> `@media (max-width:639px)`
- `@container md-gt` -> `@container (min-width:768px)`

## Animation Rewriting

- `@keyframes slideIn` -> `@keyframes as--N-slideIn`
- `animation: slideIn ...` -> `animation: as--N-slideIn ...`
- `animation-name` entries are rewritten similarly.
- `@keyframes var(--name)` is intentionally left unchanged.

## Quote / Escape Safeguards

The rewriter avoids altering escaped and quoted selector content where possible:

- Escaped chars remain escaped.
- Quoted literals are not treated as scope markers.
- Attribute selectors and function arguments are preserved conservatively.

For validation examples, see `examples/edge-case-test.html`.
