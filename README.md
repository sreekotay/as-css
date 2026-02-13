# as-css

Component-scoped CSS at runtime with zero build tooling.

**Examples:** [Live](https://sreekotay.github.io/as-css/) | [`examples/demo.html`](./examples/demo.html) | [`examples/edge-case-test.html`](./examples/edge-case-test.html)

## What It Does

- Scopes each component style block to a generated class (`as--1`, `as--2`, ...)
- Supports `<style as-css>` and `<as-style>`
- Rewrites keyframes/animation names to avoid collisions
- Supports reusable named styles via `as-name` and `as-class`
- Supports runtime updates with `dynamic` (rare, for JS mutation of stylesheet text/rules)

## Install / Include

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/as-css@1/dist/as-css.min.js"></script>
```

or

```html
<script src="https://unpkg.com/as-css@1/dist/as-css.min.js"></script>
```

### npm + self-hosted

```bash
npm install as-css
```

Then serve:

```html
<script src="/assets/as-css.min.js"></script>
```

### Local dev (this repo)

```html
<script src="./src/as-css.js"></script>
```

Version guidance:

- `@1` for major pinning
- `@1.0.0` for exact pinning
- Avoid `@latest` in production

## Minimal Example

```html
<script src="https://cdn.jsdelivr.net/npm/as-css@1/dist/as-css.min.js"></script>

<div class="card">
  <style as-css>
    & { padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    .title { font-weight: 700; }
    &:hover { box-shadow: 0 4px 8px rgba(0,0,0,.12); }
  </style>
  <h3 class="title">Scoped card</h3>
</div>
```

Runtime behavior:

- Parent gets a scope class, e.g. `.as--1`
- `&` -> `.as--1`
- `.title` -> `.as--1 .title`
- `&:hover` -> `.as--1:hover`

## Core Rules

- `&` and `*` reference the container
- Selectors without `&` are descendant-scoped
- `:hover` becomes descendant hover (`.scope :hover`)
- `&:hover` targets container hover (`.scope:hover`)
- `@media sm-lt`, `@container md-gt`, etc. are expanded at runtime

Breakpoints:

- `xs-lt/gt` -> `479/480`
- `sm-lt/gt` -> `639/640`
- `md-lt/gt` -> `767/768`
- `lg-lt/gt` -> `1023/1024`
- `xl-lt/gt` -> `1279/1280`
- `xx-lt/gt` -> `1535/1536`

## Named Styles

Use named styles when you want to define scoped CSS once and reuse it across many elements.

Define a shared style:

```html
<style as-css as-name="card-theme">
  & { padding: 1rem; border-radius: 8px; }
  .title { font-weight: 700; }
</style>
```

Apply:

```html
<div as-class="card-theme">
  <h3 class="title">Reused</h3>
</div>
```

How it works:

- Definition uses `as-name="theme-name"`
- Usage uses `as-class="theme-name"` (space-separated values are allowed)
- Definitions are hoisted and deduplicated, so duplicates do not re-register
- References receive the same generated scope classes as the definition

## Strong + Dynamic

### Strong scoping

Use `strong` when framework styles are winning on specificity.

```html
<style as-css strong>
  .btn { background: rebeccapurple; }
</style>
```

Strong named styles are supported too:

```html
<style as-css as-name="brand-card" strong>
  & { border: 2px solid #6b46c1; }
</style>

<div as-class="brand-card">
  <button class="btn">Inherited strong scope</button>
</div>
```

What `strong` does:

- Adds `as-strong` to the target element
- Uses a chained scope selector (`.scope.as-strong ...`) for higher specificity
- For named styles, references inherit strong behavior from the definition

### Dynamic updates

Use `dynamic` when JS mutates stylesheet text/rules after initial render (for example changing `<style as-css>` content). This is usually uncommon, but it does happen in theme engines, live editors, and generated runtime styles.

This is different from normal element inline-style updates (`el.style.color = ...`), which are common and do not require `dynamic`:

```html
<style as-css dynamic>
  & { background: steelblue; }
</style>

<script>
  const styleEl = document.querySelector('style[as-css][dynamic]');
  styleEl.textContent = '& { background: tomato; }';
</script>
```

When to use `dynamic`:

- Theme/color changes driven by JS state
- Runtime component style generation
- Live playground/editor experiences

## Internals

- Runtime internals: [`docs/internals-runtime.md`](./docs/internals-runtime.md)
- Selector and rewrite notes: [`docs/internals-selectors.md`](./docs/internals-selectors.md)

Utility API:

```js
as.css.resetAnimations(element);
as.css.resetAnimations(element, '.child');
as.css.replace(styleElementOrChild, newCssText);
```

## Compatibility / Caveats

- Chrome/Edge 88+, Firefox 78+, Safari 14+
- No IE11
- Shadow DOM already provides native style isolation

## Project Scripts

- `npm run build` -> build minified runtime
- `npm run pages` -> build `.pages` artifact for GitHub Pages
- `npm run watch` -> rebuild on source changes

## Publish

```bash
npm run build
npm version patch
npm publish
```

Verify:

- `https://www.npmjs.com/package/as-css`
- `https://cdn.jsdelivr.net/npm/as-css@latest/dist/as-css.min.js`
- `https://unpkg.com/as-css@latest/dist/as-css.min.js`
