## VISUAL_ENHANCEMENT_TYPOGRAPHY_HIERARCHY

# Visual Enhancement: Typography Hierarchy System

**Category:** Visual Design
**Priority:** Medium
**Status:** ✅ Complete (Phase 1)
**Date:** 2026-02-15
**Version:** v0.11.0-alpha

## Problem Statement

### Issue Description

**Location:** `src/typography.css`, various CSS files

While Material Design 3 typescale tokens were defined (lines 3-17 in typography.css), they were not consistently applied across the codebase. Many components used hardcoded pixel values (e.g., `font-size: 32px`, `font-size: 1rem`) instead of design tokens, creating inconsistent typography hierarchy.

**Audit Results:**

- **16 CSS files** scanned
- **117 violations** identified (hardcoded font-size declarations)
- **10 files** require migration

**User Impact:**

- Inconsistent visual hierarchy across components
- Difficult to maintain typographic consistency
- Manual effort required for responsive scaling
- Theme customization challenging
- Material Design 3 compliance incomplete

**Severity Rationale:**

- Affects visual consistency across 100% of UI components
- Reduces maintainability (duplicate font-size values)
- Hinders responsive design (manual breakpoints needed)
- Makes theme customization (dark mode, etc.) harder

## Solution Implemented

### Overview

Enhanced the typography system with comprehensive design tokens, utility classes, and responsive scaling. Created a complete Material Design 3 typography implementation that's easy to apply and maintain.

### Architecture

**1. Enhanced Design Token System** (`src/typography.css`, 70 → 370 lines)

**Token Structure:**

```
--md-sys-typescale-{category}-{size}[-{property}]
```

**15 Complete Typescales:**

- **5 categories:** display, headline, title, body, label
- **3 sizes per category:** large, medium, small
- **4 properties per typescale:** base size, weight, line-height, tracking (labels only)

**Example Token Set:**

```css
:root {
  /* Headline Large */
  --md-sys-typescale-headline-large: 32px;
  --md-sys-typescale-headline-large-weight: 400;
  --md-sys-typescale-headline-large-line-height: 1.25;
}
```

**2. Utility Class System**

**15 Utility Classes:**

```css
.text-display-large, .text-display-medium, .text-display-small
.text-headline-large, .text-headline-medium, .text-headline-small
.text-title-large, .text-title-medium, .text-title-small
.text-body-large, .text-body-medium, .text-body-small
.text-label-large, .text-label-medium, .text-label-small
```

**Each class includes:**

- Font size token
- Font weight token
- Line height token
- Letter spacing (for labels)

**3. Responsive Scaling**

**Mobile (≤768px):**

```css
@media (max-width: 768px) {
  :root {
    --md-sys-typescale-display-large: 45px;  /* was 57px */
    --md-sys-typescale-display-medium: 36px; /* was 45px */
    --md-sys-typescale-display-small: 32px;  /* was 36px */
    --md-sys-typescale-headline-large: 28px; /* was 32px */
    --md-sys-typescale-headline-medium: 24px; /* was 28px */
  }
}
```

**Small Mobile (≤480px):**

```css
@media (max-width: 480px) {
  :root {
    --md-sys-typescale-display-large: 36px;  /* was 45px */
    --md-sys-typescale-headline-large: 24px; /* was 28px */
    /* Further reduction for smallest screens */
  }
}
```

**Body, Title, Label unchanged** to maintain reading comfort on mobile.

**4. Semantic HTML Integration**

**Automatic Token Application:**

```css
h1 { font-size: var(--md-sys-typescale-headline-large); }
h2 { font-size: var(--md-sys-typescale-headline-medium); }
h3 { font-size: var(--md-sys-typescale-headline-small); }
h4 { font-size: var(--md-sys-typescale-title-large); }
h5 { font-size: var(--md-sys-typescale-title-medium); }
h6 { font-size: var(--md-sys-typescale-title-small); }
p  { font-size: var(--md-sys-typescale-body-medium); }
```

**Benefits:**

- No classes needed for semantic HTML
- Better SEO and accessibility
- Screen reader hierarchy preservation

## Typography Scale Reference

### Display Scale (57px - 36px)

**Use for:** Hero sections, splash screens,

---

## TYPOGRAPHY_GUIDE

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

<p class="t
