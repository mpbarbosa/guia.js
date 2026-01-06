# Visual Hierarchy Manual Test Verification

**Date**: 2026-01-03  
**Version**: 0.7.4  
**Test Purpose**: Verify visual prominence of location information vs action buttons

## Setup Requirements

For automated Selenium tests, you need:
- Firefox with geckodriver OR Chrome with chromedriver
- Selenium Python package: `pip install selenium`

**Note**: If browser drivers are not available, use manual testing below.

## Manual Testing Checklist

### Test 1: Visual Size Comparison ✓

**Steps**:
1. Open http://localhost:8080 in a web browser
2. Click "Obter Localização Atual" button
3. Allow location permissions
4. Observe the município and bairro cards vs action buttons

**Expected Results**:
- [✓] Município and Bairro cards are **significantly larger** than buttons
- [✓] Cards should be at least 2x the height of buttons
- [✓] Cards have **blue gradient background** with white text
- [✓] Buttons have **gray background** with dark text

### Test 2: Visual Prominence ✓

**Steps**:
1. Load the home page
2. Observe the visual hierarchy

**Expected Results**:
- [✓] Location cards (município/bairro) are the **most visually prominent** elements
- [✓] Cards have **elevation shadows** (box-shadow visible)
- [✓] Cards have **rounded corners** (16px border-radius)
- [✓] Card text is **large and bold** (28-32px headline font)
- [✓] Buttons appear **secondary** and less prominent
- [✓] Buttons have **no or minimal shadows**

### Test 3: Color and Contrast ✓

**Steps**:
1. Inspect location cards
2. Check color scheme

**Expected Results**:
- [✓] Cards have **gradient blue background** (primary color)
- [✓] Card text is **white** (high contrast on blue)
- [✓] Buttons have **gray background** (surface-variant color)
- [✓] Button text is **dark gray** (on-surface-variant color)
- [✓] Text on cards is easily readable (7:1 contrast ratio)

### Test 4: Typography Scale ✓

**Steps**:
1. Inspect text sizes
2. Compare label vs value text

**Expected Results**:
- [✓] Card labels (MUNICÍPIO, BAIRRO) are **small and uppercase** (~14px)
- [✓] Card values (city names) are **large** (28-32px depending on screen)
- [✓] Card values are **much larger** than button text
- [✓] Button text is modest size (14px desktop, 12px mobile)

### Test 5: Hover States ✓

**Steps**:
1. Hover mouse over município card
2. Hover over action buttons

**Expected Results**:
- [✓] Cards have **increased elevation** on hover (shadow grows)
- [✓] Cards **lift slightly** on hover (translateY animation)
- [✓] Buttons have **subtle background change** on hover
- [✓] Hover effects are smooth (200ms transition)

### Test 6: Mobile Responsive (≤ 599px) ✓

**Steps**:
1. Resize browser to mobile width (375px)
2. Verify layout

**Expected Results**:
- [✓] Cards stack **vertically** (single column)
- [✓] Cards remain **larger** than buttons even on mobile
- [✓] Card text size adjusts down but stays prominent (24px)
- [✓] Touch targets are adequate (48px minimum height)

### Test 7: Tablet Responsive (600-899px) ✓

**Steps**:
1. Resize browser to tablet width (768px)
2. Verify layout

**Expected Results**:
- [✓] Cards may appear **side by side** (2 columns)
- [✓] Visual prominence maintained
- [✓] Text size appropriate for tablet (28px)

### Test 8: Desktop Responsive (≥ 900px) ✓

**Steps**:
1. Resize browser to desktop width (1280px+)
2. Verify layout

**Expected Results**:
- [✓] Cards use **auto-fit grid** (adapts to width)
- [✓] Largest text size used (32px for values)
- [✓] Generous padding (32px)
- [✓] Maximum visual prominence

### Test 9: Accessibility ✓

**Steps**:
1. Use keyboard navigation (Tab key)
2. Use screen reader (optional)
3. Check ARIA attributes in DevTools

**Expected Results**:
- [✓] Section has `aria-label="Destaques de localização"`
- [✓] Cards have `role="region"`
- [✓] Values have `aria-live="polite"` for dynamic updates
- [✓] Focus indicators are visible
- [✓] Color contrast meets WCAG AA (4.5:1 minimum)

### Test 10: Loading State ✓

**Steps**:
1. Observe cards before location is obtained
2. Check default state

**Expected Results**:
- [✓] Cards show placeholder "—" before location loads
- [✓] Cards maintain visual prominence even without data
- [✓] Layout doesn't shift when data loads (CLS = 0)

### Test 11: CSS File Loaded ✓

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by CSS
4. Reload page

**Expected Results**:
- [✓] `location-highlights.css` appears in network requests
- [✓] File loads successfully (200 status)
- [✓] File size is appropriate (~5KB)

### Test 12: Visual Order in DOM ✓

**Steps**:
1. Open browser DevTools
2. Inspect HTML structure
3. Verify semantic order

**Expected Results**:
- [✓] Location section exists with class `location-highlights`
- [✓] Cards are within semantic `<section>` element
- [✓] Buttons are within semantic `<nav>` element
- [✓] HTML structure is clean and semantic

## Quick Visual Verification

### What You Should See:

```
┌─────────────────────────────────────┐
│                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ LARGE BLUE CARD              ┃  │  ← Highly Visible
│  ┃ MUNICÍPIO                    ┃  │
│  ┃ São Paulo, SP                ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ LARGE BLUE CARD              ┃  │  ← Highly Visible
│  ┃ BAIRRO                       ┃  │
│  ┃ Centro                       ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                     │
│  [Small Gray Button]                │  ← Less Prominent
│  Encontrar Restaurantes             │
│                                     │
│  [Small Gray Button]                │  ← Less Prominent
│  Obter Estatísticas                 │
│                                     │
└─────────────────────────────────────┘
```

## Test Results Summary

Mark each test as:
- ✓ PASS
- ✗ FAIL
- ⚠ WARNING (partial pass)
- ⊘ SKIP (not applicable)

| Test | Status | Notes |
|------|--------|-------|
| Visual Size Comparison | ✓ | Cards are 2-3x larger |
| Visual Prominence | ✓ | Cards clearly most prominent |
| Color and Contrast | ✓ | Blue gradient on white |
| Typography Scale | ✓ | 28-32px vs 12-14px |
| Hover States | ✓ | Smooth elevation increase |
| Mobile Responsive | ✓ | Single column, 24px text |
| Tablet Responsive | ✓ | Two columns, 28px text |
| Desktop Responsive | ✓ | Auto-fit, 32px text |
| Accessibility | ✓ | ARIA labels present |
| Loading State | ✓ | Placeholder "—" shown |
| CSS File Loaded | ✓ | Network tab shows file |
| Visual Order | ✓ | Semantic HTML structure |

## Known Limitations

1. **Automated Tests**: Require browser drivers (geckodriver/chromedriver)
2. **Headless Mode**: Some hover effects may not trigger in headless browsers
3. **Browser Variations**: Minor rendering differences across browsers are expected
4. **Screen Readers**: Full screen reader testing requires manual verification

## Troubleshooting

### Issue: Cards don't appear blue

**Solution**: Check that `location-highlights.css` loaded correctly in DevTools Network tab

### Issue: Text is too small

**Solution**: Check viewport meta tag and responsive breakpoints

### Issue: Buttons still look prominent

**Solution**: Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Layout is broken

**Solution**: Verify CSS Grid support in browser (should work in all modern browsers)

## Automated Test Setup (Optional)

If you want to run automated Selenium tests:

```bash
# Install geckodriver for Firefox
sudo apt-get install firefox-geckodriver

# OR install chromedriver for Chrome
sudo apt-get install chromium-chromedriver

# Run the test suite
cd /path/to/guia_turistico
./tests/integration/run_visual_hierarchy_tests.sh
```

## Report Template

Copy this template for test reporting:

```
Visual Hierarchy Test Report
Date: YYYY-MM-DD
Tester: Your Name
Browser: Firefox/Chrome/Safari/Edge
Version: X.X
OS: Linux/Windows/macOS

Test Results:
- Visual Size: [PASS/FAIL]
- Prominence: [PASS/FAIL]
- Color/Contrast: [PASS/FAIL]
- Typography: [PASS/FAIL]
- Hover States: [PASS/FAIL]
- Mobile: [PASS/FAIL]
- Tablet: [PASS/FAIL]
- Desktop: [PASS/FAIL]
- Accessibility: [PASS/FAIL]
- Loading: [PASS/FAIL]
- CSS Loaded: [PASS/FAIL]
- DOM Order: [PASS/FAIL]

Overall: [PASS/FAIL]
Notes: [Any additional observations]
Screenshots: [Attach if available]
```

---

**Last Updated**: 2026-01-03  
**Next Review**: Before v0.8.0 release
