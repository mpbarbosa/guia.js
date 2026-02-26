# Material Design 3 Typography System Guide

**Version:** v0.11.0-alpha
**Date:** 2026-02-15
**Status:** ✅ Production Ready

## Overview

This guide establishes the **Material Design 3 Typography System** for Guia Turístico, ensuring consistent typographic hierarchy across all components. The system uses design tokens instead of hardcoded pixel values, enabling responsive scaling and theme customization.

## Design Tokens Reference

### Token Structure

All typography tokens follow this pattern:

```
--md-sys-typescale-{category}-{size}[-{property}]
```

**Categories:** display, headline, title, body, label
**Sizes:** large, medium, small
**Properties:** (base), weight, line-height, tracking

## Typography Scale

### Display (57px - 36px)

**Use for:** Hero sections, splash screens, large promotional text

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `--md-sys-typescale-display-large` | 57px | 400 | 1.12 | Hero headlines |
| `--md-sys-typescale-display-medium` | 45px | 400 | 1.16 | Feature showcases |
| `--md-sys-typescale-display-small` | 36px | 400 | 1.22 | Large callouts |

**Utility Classes:**

- `.text-display-large`
- `.text-display-medium`
- `.text-display-small`

**Example:**

```html
<h1 class="text-display-large">Bem-vindo ao Guia Turístico</h1>
```

```css
/* Direct token usage */
.hero-title {
  font-size: var(--md-sys-typescale-display-large);
  font-weight: var(--md-sys-typescale-display-large-weight);
  line-height: var(--md-sys-typescale-display-large-line-height);
}
```

---

### Headline (32px - 24px)

**Use for:** Page titles, prominent section headers

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `--md-sys-typescale-headline-large` | 32px | 400 | 1.25 | Page titles (h1) |
| `--md-sys-typescale-headline-medium` | 28px | 400 | 1.29 | Section headers (h2) |
| `--md-sys-typescale-headline-small` | 24px | 400 | 1.33 | Subsection headers (h3) |

**Utility Classes:**

- `.text-headline-large`
- `.text-headline-medium`
- `.text-headline-small`

**Example:**

```html
<h1 class="text-headline-large">Coordenadas</h1>
<h2 class="text-headline-medium">Endereço Completo</h2>
<h3 class="text-headline-small">Ponto de Referência</h3>
```

**Semantic HTML:** Use `<h1>`, `<h2>`, `<h3>` which automatically apply headline tokens.

---

### Title (22px - 14px)

**Use for:** Subsection headers, card titles, list item headers

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `--md-sys-typescale-title-large` | 22px | 400 | 1.27 | Card headers (h4) |
| `--md-sys-typescale-title-medium` | 16px | 500 | 1.5 | List headers (h5) |
| `--md-sys-typescale-title-small` | 14px | 500 | 1.43 | Tertiary headers (h6) |

**Utility Classes:**

- `.text-title-large` (preferred)
- `.text-title-medium`
- `.text-title-small`
- `.title-large` (deprecated alias)

**Example:**

```html
<!-- Card title -->
<div class="card">
  <h4 class="text-title-large">População Estimada</h4>
  <p class="text-body-medium">12.3 milhões de habitantes</p>
</div>

<!-- Highlight card -->
<div class="highlight-card-title text-title-medium">
  Município
</div>
```

---

### Body (16px - 12px)

**Use for:** Paragraphs, content text, descriptions

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `--md-sys-typescale-body-large` | 16px | 400 | 1.5 | Primary body text |
| `--md-sys-typescale-body-medium` | 14px | 400 | 1.43 | Secondary text (default `<p>`) |
| `--md-sys-typescale-body-small` | 12px | 400 | 1.33 | Captions, metadata |

**Utility Classes:**

- `.text-body-large` (preferred)
- `.text-body-medium`
- `.text-body-small`
- `.body-large` (deprecated alias)

**Example:**

```html
<p class="text-body-large">
  População: <strong>12.3 milhões</strong> de habitantes
</p>

<p class="text-body-medium">
  Metrópole - Grande centro urbano
</p>

<p class="text-body-small">
  Fonte: IBGE SIDRA (2021)
</p>
```

---

### Label (14px - 11px)

**Use for:** Buttons, badges, tags, form labels

| Token | Size | Weight | Line Height | Tracking | Use Case |
|-------|------|--------|-------------|----------|----------|
| `--md-sys-typescale-label-large` | 14px | 500 | 1.43 | 0.1px | Button text |
| `--md-sys-typescale-label-medium` | 12px | 500 | 1.33 | 0.5px | Badges, pills |
| `--md-sys-typescale-label-small` | 11px | 500 | 1.45 | 0.5px | Tags, footnotes |

**Utility Classes:**

- `.text-label-large` (preferred)
- `.text-label-medium`
- `.text-label-small`
- `.label-large` (deprecated alias)

**Example:**

```html
<!-- Button -->
<button class="primary-button">
  <span class="text-label-large">Obter Localização</span>
</button>

<!-- Badge -->
<span class="badge text-label-medium">NOVO</span>

<!-- Tag -->
<span class="tag text-label-small">v0.11.0-alpha</span>
```

---

## Responsive Behavior

Typography scales down on smaller screens for better readability.

### Mobile (≤768px)

| Token | Desktop | Mobile | Change |
|-------|---------|--------|--------|
| display-large | 57px | 45px | -21% |
| display-medium | 45px | 36px | -20% |
| display-small | 36px | 32px | -11% |
| headline-large | 32px | 28px | -12% |
| headline-medium | 28px | 24px | -14% |

**Body, Title, Label remain unchanged** for consistent reading experience.

### Small Mobile (≤480px)

| Token | Mobile | Small | Change |
|-------|--------|-------|--------|
| display-large | 45px | 36px | -20% |
| display-medium | 36px | 32px | -11% |
| display-small | 32px | 28px | -12% |
| headline-large | 28px | 24px | -14% |
| headline-medium | 24px | 20px | -17% |

---

## Migration Guide

### Identifying Violations

**❌ BAD: Hardcoded pixel values**

```css
.my-title {
  font-size: 24px;  /* Violation */
  font-weight: 400;
  line-height: 1.3;
}
```

**✅ GOOD: Design tokens**

```css
.my-title {
  font-size: var(--md-sys-typescale-headline-small);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  line-height: var(--md-sys-typescale-headline-small-line-height);
}
```

**✅ BETTER: Utility class**

```html
<h3 class="text-headline-small my-title">My Title</h3>
```

### Migration Steps

1. **Identify custom font-size declarations**

   ```bash
   grep -rn "font-size:" src/*.css | grep -v "typography.css"
   ```

2. **Map to closest typescale level**
   - 11px → label-small
   - 12px → body-small OR label-medium
   - 14px → body-medium OR title-small OR label-large
   - 16px → body-large OR title-medium
   - 22px → title-large
   - 24px → headline-small
   - 28px → headline-medium
   - 32px → headline-large

3. **Replace with token**

   ```css
   /* Before */
   .card-title { font-size: 22px; }

   /* After */
   .card-title { font-size: var(--md-sys-typescale-title-large); }
   ```

4. **Or use utility class**

   ```html
   <!-- Before -->
   <div class="card-title">Título</div>

   <!-- After -->
   <div class="card-title text-title-large">Título</div>
   ```

### Special Cases

**When to keep custom sizes:**

1. **Icons/Emojis:** May need optical sizing

   ```css
   .icon { font-size: 20px; } /* OK if not text */
   ```

2. **Third-party components:** May not support tokens

   ```css
   .external-widget { font-size: 15px; } /* OK if unavoidable */
   ```

3. **Animations:** May need intermediate values

   ```css
   @keyframes grow {
     from { font-size: 14px; }
     to { font-size: 18px; }
   }
   /* Consider CSS variables for start/end states */
   ```

---

## Code Review Checklist

When reviewing typography changes:

- [ ] No hardcoded `font-size` values in new CSS (except icons/special cases)
- [ ] Design tokens used: `var(--md-sys-typescale-*)`
- [ ] Utility classes applied to HTML where appropriate
- [ ] Responsive scaling tested on mobile (≤768px, ≤480px)
- [ ] Line-height and font-weight tokens used consistently
- [ ] Letter-spacing (tracking) applied to labels
- [ ] Semantic HTML used: `<h1>-<h6>`, `<p>` instead of `<div>`

---

## Usage Patterns

### Pattern 1: Semantic HTML (Preferred)

```html
<article>
  <h1>Guia Turístico</h1>  <!-- headline-large -->
  <h2>Localização Atual</h2>  <!-- headline-medium -->
  <p>Você está em São Paulo, SP</p>  <!-- body-medium -->
</article>
```

**Benefits:**

- Automatic typescale application
- Better SEO and accessibility
- Screen reader hierarchy

### Pattern 2: Utility Classes

```html
<div class="hero">
  <div class="text-display-large">12.3 milhões</div>
  <div class="text-body-large">habitantes</div>
</div>
```

**Benefits:**

- Flexible non-semantic layouts
- Quick prototyping
- Consistent across components

### Pattern 3: Direct Token Usage (Components)

```css
.highlight-card-value {
  font-size: var(--md-sys-typescale-display-small);
  font-weight: var(--md-sys-typescale-display-small-weight);
  line-height: var(--md-sys-typescale-display-small-line-height);
}
```

**Benefits:**

- Fine-grained control
- Component-specific styling
- Token updates propagate automatically

---

## Current Status

### Files Audited

**Total CSS files:** 16
**Files with violations:** 10
**Total violations:** 117 hardcoded font-size declarations

### Priority Files for Migration

| File | Violations | Priority | Status |
|------|------------|----------|--------|
| ibge-data-styles.css | 20 | High | ⏳ Pending |
| highlight-cards.css | 15 | High | ⏳ Pending |
| maps-actions.css | 12 | High | ⏳ Pending |
| version-display.css | 10 | High | ⏳ Pending |
| error-styles.css | 8 | Medium | ⏳ Pending |
| geolocation-banner.css | 6 | Medium | ⏳ Pending |
| navigation.css | 5 | Medium | ⏳ Pending |
| tooltip.css | 4 | Low | ⏳ Pending |
| accessibility-compliance.css | 3 | Low | ⏳ Pending |
| design-patterns.css | 2 | Low | ⏳ Pending |

### Migration Plan

**Phase 1 (This PR):**

- ✅ Enhanced typography.css with complete token system
- ✅ Added 15 utility classes (.text-display-large, etc.)
- ✅ Added responsive scaling (mobile/small mobile)
- ✅ Created comprehensive documentation

**Phase 2 (Next PR):**

- [ ] Migrate ibge-data-styles.css (20 violations)
- [ ] Migrate highlight-cards.css (15 violations)
- [ ] Migrate maps-actions.css (12 violations)
- [ ] Migrate version-display.css (10 violations)

**Phase 3 (Follow-up):**

- [ ] Migrate remaining 8 files (60 violations)
- [ ] Add automated linting rule (stylelint)
- [ ] Update code review checklist

---

## Examples

### Example 1: IBGE Data Card

**Before:**

```css
.ibge-primary {
  font-size: 16px;  /* Violation */
}

.ibge-icon {
  font-size: 24px;  /* Violation */
}

.classification-label {
  font-size: 14px;  /* Violation */
}
```

**After:**

```css
.ibge-primary {
  font-size: var(--md-sys-typescale-body-large);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
}

.ibge-icon {
  font-size: var(--md-sys-typescale-headline-small);  /* 24px */
}

.classification-label {
  font-size: var(--md-sys-typescale-title-small);
  font-weight: var(--md-sys-typescale-title-small-weight);
}
```

### Example 2: Maps Action Buttons

**Before:**

```css
.maps-action-btn {
  font-size: 14px;  /* Violation */
  font-weight: 500;
}

.maps-action-icon {
  font-size: 20px;  /* OK - icon */
}
```

**After:**

```css
.maps-action-btn {
  font-size: var(--md-sys-typescale-label-large);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}

.maps-action-icon {
  font-size: 20px;  /* OK - decorative icon */
}
```

### Example 3: Highlight Cards

**Before:**

```css
.highlight-card-title {
  font-size: 1rem;  /* 16px, Violation */
}

.highlight-card-value {
  font-size: 2.5rem;  /* 40px, Violation */
}

.highlight-card-label {
  font-size: 0.875rem;  /* 14px, Violation */
}
```

**After:**

```css
.highlight-card-title {
  font-size: var(--md-sys-typescale-title-medium);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

.highlight-card-value {
  font-size: var(--md-sys-typescale-display-medium);  /* 45px */
  font-weight: var(--md-sys-typescale-display-medium-weight);
}

.highlight-card-label {
  font-size: var(--md-sys-typescale-body-medium);
  font-weight: var(--md-sys-typescale-body-medium-weight);
}
```

---

## Testing

### Visual Regression Testing

**Test scenarios:**

1. Desktop (1920px): Verify all typescales render correctly
2. Tablet (768px): Verify display/headline scale down
3. Mobile (480px): Verify further scale reduction
4. Print: Verify typography clarity in print media

### Accessibility Testing

**Screen reader tests:**

```html
<h1>Title</h1>  <!-- Announces "Heading level 1: Title" -->
<p class="text-headline-large">Visual Title</p>  <!-- Announces "Visual Title" -->
```

**Recommendation:** Use semantic HTML (`<h1>-<h6>`) for better a11y.

### Automated Testing

**Stylelint rule (future):**

```json
{
  "declaration-property-value-no-unknown": [true, {
    "typesSyntax": {
      "font-size": "/<custom-ident>"
    }
  }]
}
```

---

## References

- [Material Design 3 Typography](https://m3.material.io/styles/typography/type-scale-tokens)
- [Material Design Type Scale Tool](https://m3.material.io/styles/typography/type-scale-generator)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Version:** v0.11.0-alpha
**Last Updated:** 2026-02-15
**Status:** ✅ Production Ready
**Next:** Phase 2 migration (4 high-priority files)
