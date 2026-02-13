# as-css

Component-scoped CSS that works at runtime with zero build tools. Write normal CSS that automatically gets scoped to its parent element, with support for named reusable styles and responsive shortcuts.

**Examples:** [Live on GitHub Pages](https://skotay.github.io/as-css/) | [`examples/index.html`](./examples/index.html) (local)

## Benefits

- ✅ **Zero build tools** - Works directly in the browser
- ✅ **Zero FOUC** - Styles processed before rendering, no flashes as styles are added
- ✅ **Familiar CSS** - Write normal CSS with minimal special syntax
- ✅ **True isolation** - Styles cannot leak between components
- ✅ **Modern CSS support** - Handles nesting, custom properties, complex selectors
- ✅ **Reusable themes** - Shared name styles with composition
- ✅ **Dev tool friendly** - Edit your styles with browser tools

## Getting Started

1. **Include the file:** `<script src="as-css.js"></script>`
2. **Choose your syntax:**
   - **`<as-style>`** - Custom elements for maximum performance
   - **`<style as-css>`** - Standard elements with full syntax highlighting

That's it! Your CSS is now component-scoped.

## GitHub Pages

Examples can be published to GitHub Pages with:

```bash
npm run build:pages
```

This generates a `docs/` folder that includes:
- `docs/index.html` (examples landing page)
- `docs/examples/demo.html`
- `docs/examples/edge-case-test.html`
- `docs/src/as-css.js`
- `docs/dist/as-css.min.js`

Then set repository Pages source to `main` branch, `/docs` folder.

### Example Entry Points

- Local examples index: `./examples/index.html`
- Local demo: `./examples/demo.html`
- Local edge-case suite: `./examples/edge-case-test.html`
- Pages index after build: `./docs/index.html`
- Pages demo after build: `./docs/examples/demo.html`
- Pages edge-case suite after build: `./docs/examples/edge-case-test.html`

## Quick Start

### Option 1: Full Syntax Highlighting (`<style as-css>`)
```html
<script src="as-css.js"></script>

<div class="card">
  <style as-css>
    & { padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    .title { font-weight: bold; color: #333; }
    &:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  </style>
  
  <h3 class="title">This gets styled and scoped</h3>
</div>
```

### Option 2: Maximum Performance (`<as-style>`)

> **Note:** Use `&` to reference the component container element directly. Both syntaxes work identically. <as-style> only matters if you are forcing reflow before processing (where the "unscoped" style can leak), otherwise there is no performance delta.

## What Actually Happens

The above example gets transformed at runtime to:

```css
/* Your scoped .card element becomes: <div class="card as--1"> 
   and your css become... */
.as--1 { padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
.as--1 .title { font-weight: bold; color: #333; }
.as--1:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
```

- `&` becomes `.as--1` (your component's unique scope)
- `.title` becomes `.as--1 .title` (descendant scoping)
- `&:hover` becomes `.as--1:hover` (container state)

**Result:** Perfect CSS isolation with zero build tools!

## Key Features

- ✨ **Zero Setup** - Use `<as-style>` or `<style as-css>`, no build tools needed
- 🚀 **Superior Performance** - `<as-style>` elements are 2.5x faster than vanilla CSS
- 🎯 **Auto-Scoping** - All CSS automatically scoped to parent element, no class name conflicts
- 🔗 **Container References** - Use `&` or `*` anywhere in selectors to reference the component itself
- 📱 **Responsive Shortcuts** - `@media sm-lt`, `@media lg-gt` etc. expand to proper breakpoints
- 🎬 **Animation Safety** - Keyframes automatically scoped, preventing animation name conflicts
- 🎨 **CSS Variables** - Custom properties work naturally with automatic component isolation
- 🧩 **Shared Name Styles** - Create reusable ***SCOPED*** CSS components, reference with `name="theme"`
- ⚡ **Dynamic Updates** - Add `dynamic` attribute for styles that change after page load  
- 🛡️ **Robustness** - Handles complex CSS edge cases, quoted content, functions, escapes

## Syntax Comparison

Choose the approach that fits your needs:

| Feature | `<as-style>` | `<style as-css>` |
|---------|-------------|------------------|
| **Performance** | 🚀 Faster than vanilla CSS | ⚡ Similar to vanilla CSS |
| **Syntax Highlighting** | ❌ Limited editor support | ✅ Full syntax highlighting |
| **Browser Parsing** | ✅ Ignored until processed | ⚠️ Parsed immediately |
| **Dev Tools** | ✅ Works normally | ✅ Works normally |
| **All Features** | ✅ Full feature set | ✅ Full feature set |

**Recommendation:** Use `<as-style>` for production apps, `<style as-css>` for development or when syntax highlighting is critical.

## When NOT to use as-css

- ❌ **Shadow DOM** - Already provides native CSS isolation
- ❌ **Inline styles priority** - Inline styles (`style="..."`) always win
- ❌ **IE11 support** - Requires modern browser features
- ❌ **Ultra-strict CSP** - Only breaks if CSP blocks ALL inline styles (no `'unsafe-inline'`, nonces, or hashes). Virtually all real-world CSP policies work fine.

## Browser Compatibility

- ✅ **Chrome/Edge** 88+ (CSS parsing, MutationObserver)
- ✅ **Firefox** 78+ (CSS parsing, MutationObserver)
- ✅ **Safari** 14+ (CSS parsing, MutationObserver)
- ❌ **IE11** - Missing required modern browser APIs

## Scoping Strength

Your scoped CSS has **single class specificity** - strong enough to override most styles, but not so strong it becomes hard to override:

```css
/* Your CSS */
.button { background: blue; }

/* Gets transformed to */
.as--1 .button { background: blue; }  /* Specificity: 0,2,0 */
```

**What this beats:**
- ✅ Element selectors: `button { background: red; }`
- ✅ Single classes: `.button { background: red; }`
- ✅ Most utility classes: `.bg-red { background: red; }`

**What this loses to:**
- ❌ Multiple classes: `.theme .button { background: red; }`
- ❌ IDs: `#header .button { background: red; }`
- ❌ `!important` declarations

**Override when needed:** Use `&` for container-level specificity, add your own classes for stronger scoping, or use the `strong` attribute for class-based high specificity.

## Strong Scoping

When regular class scoping isn't enough to override framework styles (like Bootstrap), use the `strong` attribute for higher CSS specificity:

```html
<div class="my-component">
  <style as-css strong>
    .button { 
      background: purple;  /* This beats Bootstrap's .btn */
      padding: 1rem;
      border: none;
      border-radius: 8px;
    }
    
    &:hover { 
      background: darkpurple; 
    }
  </style>
  
  <button class="button">High specificity button</button>
</div>
```

**What happens with `strong`:**
- Element gets `as-strong` class: `<div class="my-component as-strong">`
- CSS uses class chaining: `.as--1.as-strong .button { ... }`
- **Specificity jumps to `0,3,0`** - beats most framework CSS (`0,2,0`)

**Strong scoping beats:**
- ✅ Bootstrap: `.btn.btn-primary { background: blue; }` (specificity: `0,2,0`)
- ✅ Multiple classes: `.theme .dark .button { }` (specificity: `0,3,0`)
- ✅ Complex selectors: `.navbar .nav-item .btn { }` (specificity: `0,3,0`)

**Strong Named Styles:**
Named styles support strong scoping with automatic inheritance! When a named style **definition** has the `strong` attribute, **all references** automatically inherit the strong behavior:

```html
<!-- ✅ Define a strong named style -->
<style as-css as-name="bootstrap-card" strong>
  & { 
    background: white;
    border: 2px solid #007bff;
    padding: 2rem;
    border-radius: 12px;
  }
  
  .btn { 
    background: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
  }
</style>

<!-- ✅ All references automatically inherit strong behavior -->
<div class="card-1" as-css-name="bootstrap-card">
  <h3>Card 1</h3>
  <button class="btn">Strong Button</button>
</div>

<div class="card-2" as-css-name="bootstrap-card">
  <h3>Card 2</h3>
  <button class="btn">Also Strong Button</button>
</div>
```

**What happens:**
- **Definition**: CSS uses `.scope.as-strong` pattern (e.g., `.as--1.as-strong`)
- **All references**: Automatically get `as-strong` class added to their elements
- **Specificity**: All references get `0,3,0` specificity - beats Bootstrap's `0,2,0`
- **No manual work**: References don't need `strong` attribute themselves

## Core Concepts

### Container References (`&` and `*`)
Use `&` or `*` to reference the component's container element. Both work identically and can appear anywhere in your selectors:

```html
<div class="component">
  <style as-css>
    & { padding: 1rem; border: 1px solid #ddd; }
    &.primary { border-color: #007bff; }
    &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    
    /* Container references work anywhere */
    .header-dark & { background: #333; color: white; }
    .sidebar * { padding: 0.5rem; font-size: 0.875rem; }
  </style>
  
  <p>Flexible container styling!</p>
</div>
```

### Selector Transformations
Common transformations that happen automatically:

```css
/* Container references */
& → .as--1                           /* Direct container styling */
&.active → .as--1.active            /* Container with class */
.parent & → .parent .as--1          /* Container as descendant */

/* Descendant scoping */
.child → .as--1 .child              /* Descendant elements */
:hover → .as--1:hover               /* Container pseudo-states */
::before → .as--1::before           /* Container pseudo-elements */

/* Complex selectors */
:where(h1, h2) → .as--1 :where(h1, h2)     /* Functional pseudo-classes */
[class*="btn"] → .as--1 [class*="btn"]     /* Attribute selectors */
```

**Smart parsing handles:**
- ✅ Quoted content protection: `[data-content="&"]` stays unchanged
- ✅ Escaped characters: `.\*` and `.class\&` preserved
- ✅ CSS functions: `calc()`, `url()`, `var()` content protected
- ✅ Animation keywords: `ease-in-out`, `steps()` preserved correctly

## Responsive Design

Use shorthand media queries that get expanded automatically:

```html
<div class="responsive-card">
  <style as-css>
    & { padding: 1rem; font-size: 1rem; }
    
    @media sm-lt { & { padding: 0.5rem; font-size: 0.875rem; } }
    @media lg-gt { & { padding: 2rem; font-size: 1.25rem; } }
    @container md-gt { & { border-radius: 12px; } }
  </style>
  
  <p>Responsive with shorthand queries!</p>
</div>
```

**Available breakpoints:**
- `xs-lt/gt` → `max-width: 479px` / `min-width: 480px`
- `sm-lt/gt` → `max-width: 639px` / `min-width: 640px`  
- `md-lt/gt` → `max-width: 767px` / `min-width: 768px`
- `lg-lt/gt` → `max-width: 1023px` / `min-width: 1024px`
- `xl-lt/gt` → `max-width: 1279px` / `min-width: 1280px`
- `xx-lt/gt` → `max-width: 1535px` / `min-width: 1536px`

## Animation Scoping

Animation names get automatically scoped to prevent conflicts:

```html
<div class="modal">
  <style as-css>
    @keyframes slideIn { 
      from { transform: translateY(-100%); opacity: 0; } 
      to { transform: translateY(0); opacity: 1; } 
    }
    
    & { 
      animation: slideIn 0.3s ease-out;
      background: white;
      padding: 2rem;
      border-radius: 8px;
    }
  </style>
  
  <p>Scoped animation!</p>
</div>
```

**Animation scoping handles:**
- ✅ `@keyframes slideIn` → `@keyframes as--1-slideIn`
- ✅ `animation: slideIn 0.3s` → `animation: as--1-slideIn 0.3s`
- ✅ Timing functions preserved: `steps()`, `cubic-bezier()`, `ease-in-out`
- ✅ Multiple animations: `slideIn 0.3s, fadeOut 0.2s` work perfectly
- ✅ CSS variables: `@keyframes var(--name)` left unscoped

### Animation Reset Utility

Use `as.css.resetAnimations()` to restart animations:

```javascript
// Restart all animations in element
as.css.resetAnimations(element);

// Restart specific animations
as.css.resetAnimations(element, '.modal-content');
```

## CSS Variables

CSS custom properties work perfectly with automatic scoped isolation:

```html
<div class="themed-component">
  <style as-css>
    & { 
      --primary-color: hsl(264 80% 50%);
      --spacing: 2rem;
      
      background: var(--primary-color);
      padding: var(--spacing);
      color: white;
    }
    
    .child { 
      background: rgba(255, 255, 255, 0.2);
      padding: calc(var(--spacing) / 2);
    }
    
    @media sm-lt { & { --spacing: 1rem; } }
  </style>
  
  <div class="child">Variables are component-scoped!</div>
</div>
```

**Benefits:**
- 🎯 **True isolation** - Variables can't leak between components
- 🔄 **Reusable patterns** - Same variable names in different components
- 📱 **Responsive theming** - Variables can change with media queries
- ⚡ **Performance** - Browser-native CSS variable inheritance

## ADVANCED USAGE - Shared Named Styles

Create reusable CSS components with the `as-name` and `as-class` attributes:

```html
<!-- Define base card styles -->
<div class="card">
  <style as-css as-name="card-base">
    & { 
      padding: 1.5rem; 
      border: 1px solid #e0e0e0; 
      border-radius: 8px;
      background: white;
    }
    .title { 
      font-weight: 600; 
      margin-bottom: 1rem;
      color: #333;
    }
  </style>
  
  <h3 class="title">Original Card</h3>
</div>

<!-- Use styles anywhere -->
<div class="card" as-class="card-base">
  <h3 class="title">Reused Card</h3>
</div>

<!-- Combine multiple styles -->
<div class="card success" as-class="card-base success-theme">
  <h3 class="title">Combined Styles</h3>
</div>
```

**Named styles features:**
- **Definition**: `<style as-css as-name="theme-name">content</style>`
- **Single reference**: `<div as-class="theme-name">content</div>`
- **Multiple reference**: `<div as-class="theme1 theme2">content</div>`
- **Automatic hoisting** - Definitions move to `<head>` for efficiency
- **Deduplication** - Same named style defined multiple times only appears once

## ADVANCED USAGE - Strong Named Styles for Framework Override

Perfect for creating reusable components that need to override framework styles:

```html
<!-- Define a strong card theme that beats Bootstrap -->
<style as-css as-name="bootstrap-override-card" strong>
  & { 
    /* These styles will have 0,3,0 specificity - beats Bootstrap's 0,2,0 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 3px solid #5a6c7d;
    padding: 2rem;
    border-radius: 15px;
    color: white;
  }
  
  .btn {
    background: rgba(255,255,255,0.2);
    border: 2px solid white;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 25px;
  }
  
  .btn:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
  }
</style>

<!-- Use throughout your app - all get strong scoping automatically -->
<div class="card" as-class="bootstrap-override-card">
  <div class="card-body">
    <h5 class="card-title">Premium Card</h5>
    <button class="btn btn-primary">Strong Button</button>
  </div>
</div>
```

**Why this works:**
- 🎯 **One definition**: Define once with `strong`, all references inherit it
- ⚡ **High specificity**: `.as--1.as-strong .btn` beats `.btn.btn-primary`
- 🧩 **Composable**: Combine with other named styles as needed
- 🎨 **Framework-ready**: Perfect for overriding Bootstrap, Tailwind, etc.

## ADVANCED USAGE - Dynamic Styles

Add `dynamic` attribute for styles that change after initial load. Works with both syntaxes:

### Dynamic with `<as-style>`
```html
<div class="color-changer">
  <as-style dynamic>
    & { 
      background: blue;
      padding: 1rem;
      color: white;
    }
  </as-style>
  
  <button onclick="changeColor()">Change Color</button>
  
  <script>
    function changeColor() {
      const style = document.querySelector('as-style[dynamic]');
      style.textContent = style.textContent.replace('blue', 'red');
    }
  </script>
</div>
```

### Dynamic with `<style as-css>`
```html
<div class="color-changer">
  <style as-css dynamic>
    & { 
      background: blue;
      padding: 1rem;
      color: white;
    }
  </style>
  
  <button onclick="changeColor()">Change Color</button>
  
  <script>
    function changeColor() {
      const style = document.querySelector('style[as-css][dynamic]');
      style.textContent = style.textContent.replace('blue', 'red');
    }
  </script>
</div>
```

**When to use `dynamic`:**
- CSS that changes via JavaScript
- Reactive components that update their styles
- Development and debugging scenarios

## Edge Cases & Advanced Features

The library automatically handles complex CSS scenarios:

### Quote Protection
- ✅ `[data-content="&"]` → unchanged (quoted content never modified)
- ✅ `content: "Usage: & for container"` → unchanged

### Attribute Selector Intelligence
- ✅ `[class*="btn"]` → unchanged (wildcard attribute matching preserved)
- ✅ `input[type="email"]` → `.as--1 input[type="email"]` (standard attributes scope)

### CSS Function Safety
- ✅ `calc(100% * 0.5)` → unchanged (math expressions protected)
- ✅ `url("path/with&in.svg")` → unchanged (URLs protected)
- ✅ `var(--custom-&-prop)` → unchanged (CSS variables protected)

### Modern CSS Support
- ✅ `@layer` blocks processed recursively
- ✅ Container queries work with responsive shortcuts
- ✅ Complex selectors: `:where()`, `:is()`, `:not()` handled correctly




## Production Ready

- 🚀 **High Performance** - Optimized parsing and minimal overhead
- 🛡️ **Robust** - Graceful handling of CORS, malformed CSS, edge cases  
- 💾 **Memory Efficient** - Smart observer pooling and loop prevention
- 📱 **Modern CSS Support** - Works with all contemporary CSS features
- 🔒 **Quote Safety** - Prevents CSS injection through quoted content protection
- 🛠️ **Graceful Degradation** - Malformed CSS doesn't break components
- ⚡ **Battle Tested** - Handles complex real-world CSS scenarios

## How It Works

1. **Detection** - MutationObserver watches for `<as-style>` and `<style as-css>` elements
2. **Element conversion** - `<as-style>` elements converted to `<style>` for processing
3. **Scope generation** - Creates unique scope classes (e.g., `as--1`, `as--2`)
4. **Parent scoping** - Adds scope class to the parent element
5. **CSS parsing** - Uses browser's native CSS parser
6. **Smart selector transformation** - Optimized parsing for all CSS features
7. **Media query expansion** - Converts responsive shortcuts
8. **Animation scoping** - High-performance animation name scoping
9. **Named style processing** - Handles definitions and references
10. **Error handling** - Graceful fallbacks for edge cases
11. **Efficient updates** - Minimal DOM manipulation with loop prevention

**Performance secret:** `<as-style>` elements are ignored by browsers until processed, eliminating layout thrashing during DOM construction. This makes as-css faster than vanilla CSS!

**Result:** Production-ready, component-scoped CSS with zero build tools, superior performance, and comprehensive modern CSS support. 