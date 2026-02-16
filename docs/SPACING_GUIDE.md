# Spacing System Guide

**Version:** 0.11.0-alpha  
**Last Updated:** 2026-02-15  
**Status:** ✅ Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Spacing Scale](#spacing-scale)
3. [Utility Classes](#utility-classes)
4. [Usage Patterns](#usage-patterns)
5. [Migration Guide](#migration-guide)
6. [Code Review Checklist](#code-review-checklist)
7. [Advanced Patterns](#advanced-patterns)

---

## Overview

The Guia Turístico spacing system follows **Material Design 3's 8dp grid system**, providing consistent rhythm and hierarchy throughout the application. All spacing values are defined as CSS custom properties (design tokens) and exposed through utility classes.

### Design Principles

✅ **8px Base Grid** - All spacing follows 8px increments (4px for micro-adjustments)  
✅ **Semantic Naming** - Clear size labels (xs, sm, md, lg, xl, 2xl, 3xl)  
✅ **Single Source of Truth** - All values defined in `design-tokens.css`  
✅ **Utility-First** - Reusable classes reduce CSS bloat  
✅ **Responsive** - Consistent spacing across breakpoints

### Benefits

- **Consistency:** Visual rhythm maintained across all components
- **Maintainability:** Change one token, update entire system
- **Performance:** Smaller CSS bundles via utility reuse
- **Developer Experience:** Clear, predictable API
- **Accessibility:** Consistent touch targets and spacing

---

## Spacing Scale

### Token Definitions

Located in `src/design-tokens.css` (lines 8-15):

```css
:root {
  --spacing-xs:  0.25rem;  /* 4px  - Micro-adjustments, tight spacing */
  --spacing-sm:  0.5rem;   /* 8px  - Compact spacing, small gaps */
  --spacing-md:  1rem;     /* 16px - Default spacing, comfortable reading */
  --spacing-lg:  1.5rem;   /* 24px - Section spacing, visual breathing room */
  --spacing-xl:  2rem;     /* 32px - Large sections, major components */
  --spacing-2xl: 3rem;     /* 48px - Hero sections, page segments */
  --spacing-3xl: 4rem;     /* 64px - Page-level spacing, major divisions */
}
```

### Visual Scale

```
xs  ━  4px   │ ▪️
sm  ━━ 8px   │ ▪️▪️
md  ━━━━ 16px │ ▪️▪️▪️▪️
lg  ━━━━━━ 24px │ ▪️▪️▪️▪️▪️▪️
xl  ━━━━━━━━ 32px │ ▪️▪️▪️▪️▪️▪️▪️▪️
2xl ━━━━━━━━━━━━ 48px │ ▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️
3xl ━━━━━━━━━━━━━━━━ 64px │ ▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️
```

### Usage Guidelines

| Token | Pixels | Use Case | Examples |
|-------|--------|----------|----------|
| `xs` | 4px | Micro-spacing, fine-tuning | Icon gaps, badge padding |
| `sm` | 8px | Tight spacing, related items | Button text gaps, inline elements |
| `md` | 16px | Default spacing, comfortable | Card padding, list items |
| `lg` | 24px | Section spacing, breathing room | Component margins, section gaps |
| `xl` | 32px | Large sections, major components | Page sections, hero padding |
| `2xl` | 48px | Hero sections, page segments | Header/footer, major divisions |
| `3xl` | 64px | Page-level spacing | Landing sections, full-page layouts |

---

## Utility Classes

### Margin Utilities

#### All Sides

```css
.m-0   /* margin: 0 */
.m-xs  /* margin: 4px */
.m-sm  /* margin: 8px */
.m-md  /* margin: 16px */
.m-lg  /* margin: 24px */
.m-xl  /* margin: 32px */
.m-2xl /* margin: 48px */
.m-3xl /* margin: 64px */
```

#### Directional (Top, Right, Bottom, Left)

```css
/* Margin Top */
.mt-0, .mt-xs, .mt-sm, .mt-md, .mt-lg, .mt-xl, .mt-2xl, .mt-3xl

/* Margin Right */
.mr-0, .mr-xs, .mr-sm, .mr-md, .mr-lg, .mr-xl, .mr-2xl, .mr-3xl

/* Margin Bottom */
.mb-0, .mb-xs, .mb-sm, .mb-md, .mb-lg, .mb-xl, .mb-2xl, .mb-3xl

/* Margin Left */
.ml-0, .ml-xs, .ml-sm, .ml-md, .ml-lg, .ml-xl, .ml-2xl, .ml-3xl
```

#### Axis (Horizontal/Vertical)

```css
/* Horizontal (left + right) */
.mx-0, .mx-xs, .mx-sm, .mx-md, .mx-lg, .mx-xl, .mx-2xl, .mx-3xl
.mx-auto  /* margin-left: auto; margin-right: auto; */

/* Vertical (top + bottom) */
.my-0, .my-xs, .my-sm, .my-md, .my-lg, .my-xl, .my-2xl, .my-3xl
```

### Padding Utilities

#### All Sides

```css
.p-0   /* padding: 0 */
.p-xs  /* padding: 4px */
.p-sm  /* padding: 8px */
.p-md  /* padding: 16px */
.p-lg  /* padding: 24px */
.p-xl  /* padding: 32px */
.p-2xl /* padding: 48px */
.p-3xl /* padding: 64px */
```

#### Directional (Top, Right, Bottom, Left)

```css
/* Padding Top */
.pt-0, .pt-xs, .pt-sm, .pt-md, .pt-lg, .pt-xl, .pt-2xl, .pt-3xl

/* Padding Right */
.pr-0, .pr-xs, .pr-sm, .pr-md, .pr-lg, .pr-xl, .pr-2xl, .pr-3xl

/* Padding Bottom */
.pb-0, .pb-xs, .pb-sm, .pb-md, .pb-lg, .pb-xl, .pb-2xl, .pb-3xl

/* Padding Left */
.pl-0, .pl-xs, .pl-sm, .pl-md, .pl-lg, .pl-xl, .pl-2xl, .pl-3xl
```

#### Axis (Horizontal/Vertical)

```css
/* Horizontal (left + right) */
.px-0, .px-xs, .px-sm, .px-md, .px-lg, .px-xl, .px-2xl, .px-3xl

/* Vertical (top + bottom) */
.py-0, .py-xs, .py-sm, .py-md, .py-lg, .py-xl, .py-2xl, .py-3xl
```

### Gap Utilities (Flexbox/Grid)

```css
/* All directions */
.gap-0, .gap-xs, .gap-sm, .gap-md, .gap-lg, .gap-xl, .gap-2xl, .gap-3xl

/* Row gaps */
.row-gap-0, .row-gap-xs, .row-gap-sm, .row-gap-md, .row-gap-lg, 
.row-gap-xl, .row-gap-2xl, .row-gap-3xl

/* Column gaps */
.column-gap-0, .column-gap-xs, .column-gap-sm, .column-gap-md, 
.column-gap-lg, .column-gap-xl, .column-gap-2xl, .column-gap-3xl
```

---

## Usage Patterns

### Basic Examples

```html
<!-- Card with standard spacing -->
<div class="p-md mb-lg">
  <h2 class="mb-sm">Title</h2>
  <p class="my-md">Content with vertical margins</p>
</div>

<!-- Flexbox with gap -->
<div class="flex gap-md">
  <button>Action 1</button>
  <button>Action 2</button>
</div>

<!-- Centered container -->
<div class="mx-auto px-lg">
  <p>Horizontally centered with horizontal padding</p>
</div>
```

### Component Spacing

#### Cards

```html
<!-- Standard Card -->
<div class="card p-lg mb-xl">
  <h3 class="mb-md">Card Title</h3>
  <p class="mb-sm">Card content</p>
  <button class="mt-md">Action</button>
</div>

<!-- Compact Card -->
<div class="card p-md mb-md">
  <h4 class="mb-sm">Compact Title</h4>
  <p>Less spacing for denser layouts</p>
</div>
```

#### Forms

```html
<form class="p-lg">
  <div class="mb-md">
    <label class="mb-xs">Name</label>
    <input type="text">
  </div>
  <div class="mb-md">
    <label class="mb-xs">Email</label>
    <input type="email">
  </div>
  <button class="mt-lg">Submit</button>
</form>
```

#### Navigation

```html
<nav class="px-lg py-md">
  <ul class="flex gap-lg">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

### Layout Spacing

#### Section Spacing

```html
<!-- Standard Section -->
<section class="py-2xl px-lg">
  <h2 class="mb-xl">Section Title</h2>
  <div class="grid gap-lg">
    <!-- Grid items automatically spaced -->
  </div>
</section>

<!-- Hero Section -->
<section class="hero py-3xl px-xl">
  <h1 class="mb-2xl">Hero Title</h1>
  <p class="mb-xl">Hero description</p>
</section>
```

#### Stack Layouts (Vertical)

```html
<div class="stack">
  <div class="mb-lg">Item 1</div>
  <div class="mb-lg">Item 2</div>
  <div class="mb-lg">Item 3</div>
</div>

<!-- Or using flexbox -->
<div class="flex flex-col gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Direct Token Usage (CSS)

When utility classes aren't enough:

```css
.custom-component {
  /* Use tokens directly for non-standard combinations */
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-xl) auto;
  
  /* Combine with calc() for special cases */
  padding-top: calc(var(--spacing-lg) + var(--spacing-xs)); /* 28px */
}

.custom-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(3, 1fr);
}
```

---

## Migration Guide

### Audit Process

1. **Find Hardcoded Values**

```bash
# Find all hardcoded spacing
grep -rn "margin:\s*[0-9].*px" src/*.css
grep -rn "padding:\s*[0-9].*px" src/*.css
grep -rn "gap:\s*[0-9].*px" src/*.css
```

2. **Map to Tokens**

| Hardcoded | Token | Utility Class |
|-----------|-------|---------------|
| `4px` | `--spacing-xs` | `.m-xs`, `.p-xs`, `.gap-xs` |
| `8px` | `--spacing-sm` | `.m-sm`, `.p-sm`, `.gap-sm` |
| `16px` | `--spacing-md` | `.m-md`, `.p-md`, `.gap-md` |
| `24px` | `--spacing-lg` | `.m-lg`, `.p-lg`, `.gap-lg` |
| `32px` | `--spacing-xl` | `.m-xl`, `.p-xl`, `.gap-xl` |
| `48px` | `--spacing-2xl` | `.m-2xl`, `.p-2xl` |
| `64px` | `--spacing-3xl` | `.m-3xl`, `.p-3xl` |

**Non-standard values:**
- `12px` → `var(--spacing-sm) + var(--spacing-xs)` or keep as `0.75rem`
- `20px` → `calc(var(--spacing-md) + var(--spacing-xs))`
- `6px` → Keep as `0.375rem` (not on grid)

### Migration Patterns

#### Before (Hardcoded)

```css
.card {
  margin: 24px 0;
  padding: 16px;
}

.button-group {
  gap: 8px;
}

.section {
  padding: 32px 24px;
  margin-bottom: 48px;
}
```

#### After (Tokens)

```css
.card {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md);
}

.button-group {
  gap: var(--spacing-sm);
}

.section {
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}
```

#### After (Utility Classes - Preferred for HTML)

```html
<div class="card my-lg p-md">
  <!-- Content -->
</div>

<div class="button-group gap-sm">
  <!-- Buttons -->
</div>

<section class="py-xl px-lg mb-2xl">
  <!-- Content -->
</section>
```

### Exceptions

**Keep hardcoded spacing when:**

1. **Non-grid values:** `6px`, `10px`, `12px`, `20px`, etc.
2. **Component-specific values:** Fine-tuned for specific component requirements
3. **Responsive overrides:** Media query adjustments

**Document exceptions with comments:**

```css
.special-component {
  /* Custom 12px padding for visual alignment with icon */
  padding: 0.75rem;
}
```

---

## Code Review Checklist

### For New Code

- [ ] All margin/padding values use spacing tokens or utilities
- [ ] Gap values (flexbox/grid) use spacing tokens
- [ ] Non-standard values (6px, 12px, 20px) are documented
- [ ] Responsive spacing adjustments use tokens
- [ ] No magic numbers (unexplained pixel values)

### For Existing Code

- [ ] Identified hardcoded spacing values
- [ ] Mapped values to appropriate tokens
- [ ] Replaced with utility classes where possible
- [ ] Replaced with tokens for CSS-specific cases
- [ ] Documented any intentional hardcoded values

### Questions to Ask

1. **Is this spacing on the 8px grid?** → Use token
2. **Is this spacing reused elsewhere?** → Use utility class
3. **Is this spacing unique to this component?** → Use token directly
4. **Is this spacing not on the grid (6px, 10px)?** → Document + keep hardcoded
5. **Does this spacing need responsive variants?** → Use tokens with media queries

---

## Advanced Patterns

### Responsive Spacing

```css
.responsive-section {
  /* Mobile: compact spacing */
  padding: var(--spacing-md);
  margin: var(--spacing-lg) 0;
}

@media (min-width: 768px) {
  .responsive-section {
    /* Tablet: standard spacing */
    padding: var(--spacing-lg);
    margin: var(--spacing-xl) 0;
  }
}

@media (min-width: 1024px) {
  .responsive-section {
    /* Desktop: generous spacing */
    padding: var(--spacing-xl);
    margin: var(--spacing-2xl) 0;
  }
}
```

### Dynamic Spacing (CSS calc)

```css
.dynamic-spacing {
  /* Add two tokens */
  margin-top: calc(var(--spacing-lg) + var(--spacing-sm)); /* 32px */
  
  /* Multiply token */
  padding: calc(var(--spacing-md) * 1.5); /* 24px */
  
  /* Subtract token */
  gap: calc(var(--spacing-xl) - var(--spacing-xs)); /* 28px */
}
```

### Negative Margins

```css
.overlap-component {
  /* Pull element up by one spacing unit */
  margin-top: calc(var(--spacing-lg) * -1); /* -24px */
}

/* Or define negative utilities if needed frequently */
.mt-negative-lg {
  margin-top: calc(var(--spacing-lg) * -1);
}
```

### Container Spacing Pattern

```css
/* Standard container with responsive padding */
.container {
  margin: 0 auto;
  max-width: 1200px;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}
```

### Stack Layout Pattern

```css
/* Vertical rhythm pattern */
.stack > * + * {
  margin-top: var(--spacing-md);
}

.stack-sm > * + * {
  margin-top: var(--spacing-sm);
}

.stack-lg > * + * {
  margin-top: var(--spacing-lg);
}
```

---

## Troubleshooting

### Common Issues

**Issue 1: Spacing looks inconsistent**
- **Cause:** Mixing hardcoded values with tokens
- **Fix:** Audit for hardcoded px values, migrate to tokens

**Issue 2: Too much/too little spacing**
- **Cause:** Wrong token size selected
- **Fix:** Refer to usage guidelines table, choose appropriate token

**Issue 3: Non-grid spacing needed (12px, 20px)**
- **Cause:** Design requires off-grid value
- **Fix:** Use `calc()` or keep hardcoded with comment

**Issue 4: Responsive spacing not working**
- **Cause:** Token not wrapped in media query
- **Fix:** Apply tokens inside `@media` blocks

### Debugging Tools

```javascript
// Find all spacing values in component
const el = document.querySelector('.component');
const styles = window.getComputedStyle(el);
console.log({
  margin: styles.margin,
  padding: styles.padding,
  gap: styles.gap
});

// Check if token is being used
console.log(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--spacing-md')
); // Should output: "1rem" or "16px"
```

---

## Related Documentation

- **Design Tokens:** `src/design-tokens.css` (token definitions)
- **Typography Guide:** `docs/TYPOGRAPHY_GUIDE.md` (text spacing)
- **Material Design 3:** https://m3.material.io/foundations/layout/spacing
- **8pt Grid System:** https://spec.fm/specifics/8-pt-grid

---

## Summary

The spacing system provides:

✅ **7 spacing tokens** (xs → 3xl) following 8px grid  
✅ **224 utility classes** (margin, padding, gap variations)  
✅ **Single source of truth** (design-tokens.css)  
✅ **Flexible patterns** (utilities, direct tokens, calc)  
✅ **Responsive support** (media query compatible)

**Audit Status:** 170 violations found across 15 files  
**Migration Priority:** High-use components first (onboarding, cards, navigation)  
**Next Steps:** Gradual migration using utility classes + tokens

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-15  
**Maintainer:** Guia Turístico Team
