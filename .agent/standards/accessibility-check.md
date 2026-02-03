# Accessibility Checklist

> **Enterprise Standard**: WCAG 2.1 AA compliance is mandatory. No PR merges without passing this checklist.

---

## Quick Reference

| Level | Requirement | Impact |
|-------|-------------|--------|
| **A** | Minimum accessibility | Legal baseline |
| **AA** | Standard accessibility | **Required for all features** |
| **AAA** | Enhanced accessibility | Recommended where feasible |

---

## 1. Semantic Structure

### Document Outline
- [ ] **Single H1**: Page has exactly one `<h1>` element.
- [ ] **Heading Hierarchy**: Headings follow logical order (`h1` → `h2` → `h3`). No skipped levels.
- [ ] **Landmark Regions**: Page uses `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` appropriately.
- [ ] **Skip Link**: "Skip to main content" link present for keyboard users.

### Content Structure
- [ ] **Lists**: Related items use `<ul>`, `<ol>`, or `<dl>` elements.
- [ ] **Tables**: Data tables use `<th>` with `scope` attribute. Avoid tables for layout.
- [ ] **Language**: `lang` attribute set on `<html>` element. Language changes marked with `lang` on child elements.

---

## 2. ARIA Labels & Roles

### When to Use ARIA
> **First Rule of ARIA**: Don't use ARIA if native HTML provides the same functionality.

### Required ARIA Patterns
| Component | Required Attributes |
|-----------|-------------------|
| Icon Button | `aria-label="[action description]"` |
| Toggle | `aria-pressed="true/false"` |
| Expandable | `aria-expanded="true/false"` |
| Modal | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |
| Tab Panel | `role="tablist"` + `role="tab"` + `role="tabpanel"` + `aria-selected` |
| Live Region | `aria-live="polite"` or `aria-live="assertive"` |
| Loading | `aria-busy="true"` + status announcement |

### ARIA Checklist
- [ ] **Buttons**: All icon-only buttons have `aria-label`.
- [ ] **Links**: Link text is descriptive (avoid "click here", "read more").
- [ ] **Forms**: All inputs have associated labels (`<label for="">` or `aria-label`).
- [ ] **Error Messages**: Form errors use `aria-describedby` linking to error text.
- [ ] **Required Fields**: Use `aria-required="true"` and visible indicator.
- [ ] **Disabled State**: Use `aria-disabled="true"` in addition to visual styling.
- [ ] **Live Regions**: Dynamic content updates announced via `aria-live`.

### Common Anti-Patterns (Avoid)
| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| `<div onclick>` | Not focusable, no role | Use `<button>` |
| `role="button"` on `<div>` | Missing keyboard support | Use `<button>` |
| `aria-hidden="true"` on focusable | Screen reader confusion | Remove from tab order first |
| `tabindex="0"` on everything | Unpredictable focus | Only on custom interactive elements |

---

## 3. Keyboard Navigation

### Focus Management
- [ ] **Visible Focus**: All interactive elements show visible focus indicator (min 2px, 3:1 contrast).
- [ ] **Focus Order**: Tab order follows visual/logical order.
- [ ] **No Focus Trap**: User can always tab away from any component (except modals).
- [ ] **Focus Restoration**: After modal close, focus returns to trigger element.

### Keyboard Shortcuts
| Key | Expected Behavior |
|-----|-------------------|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate button/link |
| `Escape` | Close modal/dropdown |
| `Arrow keys` | Navigate within composite widgets (menus, tabs) |

### Interactive Component Checklist
- [ ] **Buttons**: Activatable with `Enter` and `Space`.
- [ ] **Links**: Activatable with `Enter` only.
- [ ] **Dropdowns**: Open with `Enter`/`Space`, navigate with arrows, close with `Escape`.
- [ ] **Modals**: Focus trapped inside, close with `Escape`, focus returns on close.
- [ ] **Tabs**: Navigate with arrow keys, activate with `Enter`/`Space`.
- [ ] **Sliders**: Adjustable with arrow keys.

### Focus Indicator Standards
```css
/* Minimum viable focus indicator */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Enhanced focus for complex backgrounds */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-focus-ring);
}
```

---

## 4. Color & Contrast

### Contrast Ratios (WCAG 2.1 AA)
| Element | Minimum Ratio | Measurement |
|---------|---------------|-------------|
| Normal text (<18px or <14px bold) | **4.5:1** | Foreground vs background |
| Large text (≥18px or ≥14px bold) | **3:1** | Foreground vs background |
| UI components (borders, icons) | **3:1** | Against adjacent colors |
| Focus indicators | **3:1** | Against adjacent colors |
| Disabled elements | No requirement | But should be distinguishable |

### Contrast Verification Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Stark Plugin**: Figma/Sketch integration
- **axe DevTools**: Browser extension
- **Lighthouse**: Built into Chrome DevTools

### Color Independence
- [ ] **Not Color Alone**: Information not conveyed by color alone (add icons, patterns, text).
- [ ] **Link Distinction**: Links distinguishable from text by more than color (underline recommended).
- [ ] **Error Indication**: Errors indicated by more than red color (icon, border, text).
- [ ] **Status Indication**: Success/warning states have icons or patterns, not just color.

### Dark Mode Considerations
- [ ] **Both Modes Tested**: Contrast verified in both light and dark modes.
- [ ] **No Pure Black**: Avoid `#000000` on `#FFFFFF` (too harsh). Use `#1a1a1a` or similar.
- [ ] **Reduced Contrast Option**: Consider `prefers-contrast: less` media query.

---

## 5. Motion & Animation

### Reduced Motion Support
- [ ] **Honor Preference**: Respect `prefers-reduced-motion: reduce`.
- [ ] **Implementation**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### Animation Guidelines
- [ ] **Duration**: UI feedback animations ≤300ms.
- [ ] **Auto-play**: No auto-playing videos/animations without user control.
- [ ] **Pause Control**: Animated content can be paused.
- [ ] **No Seizure Triggers**: No content flashing more than 3 times per second.

---

## 6. Images & Media

### Images
- [ ] **Alt Text**: All informative images have descriptive `alt` attribute.
- [ ] **Decorative Images**: Decorative images use `alt=""` or `aria-hidden="true"`.
- [ ] **Complex Images**: Charts/graphs have detailed text descriptions.
- [ ] **Text in Images**: Avoid text in images; use real text with CSS styling.

### Audio & Video
- [ ] **Captions**: Videos have synchronized captions.
- [ ] **Transcripts**: Audio content has text transcripts.
- [ ] **Audio Description**: Complex visual content described for blind users.
- [ ] **No Autoplay**: Media doesn't autoplay, or can be immediately paused.

---

## 7. Forms & Inputs

### Form Structure
- [ ] **Labels**: Every input has a visible, associated label.
- [ ] **Grouping**: Related fields grouped with `<fieldset>` and `<legend>`.
- [ ] **Error Summary**: Form errors summarized at top of form.
- [ ] **Inline Errors**: Each invalid field has adjacent error message.

### Input Requirements
- [ ] **Autocomplete**: Use `autocomplete` attribute for common fields (name, email, address).
- [ ] **Input Type**: Use appropriate `type` (email, tel, date) for mobile keyboards.
- [ ] **Placeholders**: Placeholder is not the only label (disappears on focus).
- [ ] **Help Text**: Complex fields have persistent help text (not just tooltip).

### Error Handling
```html
<!-- Proper error association -->
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<span id="email-error" role="alert">
  Please enter a valid email address.
</span>
```

---

## 8. Responsive & Zoom

### Text Scaling
- [ ] **200% Zoom**: UI remains functional at 200% browser zoom.
- [ ] **Text Resize**: Text can be resized to 200% without loss of functionality.
- [ ] **No Horizontal Scroll**: At 320px width, no horizontal scrolling required.

### Touch Targets
- [ ] **Mobile Size**: Touch targets minimum 44×44px on mobile.
- [ ] **Desktop Size**: Click targets minimum 24×24px on desktop.
- [ ] **Spacing**: Adjacent targets have adequate spacing (≥8px).

---

## 9. Testing Checklist

### Automated Testing
- [ ] **axe-core**: Run axe DevTools on all pages.
- [ ] **Lighthouse**: Accessibility score ≥100.
- [ ] **Pa11y CI**: Integrate into CI pipeline.

### Manual Testing
- [ ] **Keyboard Only**: Navigate entire feature using only keyboard.
- [ ] **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows).
- [ ] **High Contrast**: Test in Windows High Contrast Mode.
- [ ] **Zoom**: Test at 200% browser zoom.

### Screen Reader Testing Matrix
| Screen Reader | Browser | OS |
|---------------|---------|-----|
| VoiceOver | Safari | macOS |
| NVDA | Firefox | Windows |
| JAWS | Chrome | Windows |
| TalkBack | Chrome | Android |
| VoiceOver | Safari | iOS |

---

## Sign-Off

| Check | Reviewer | Date | Status |
|-------|----------|------|--------|
| Automated (axe/Lighthouse) | [Name] | [Date] | Pass/Fail |
| Keyboard Navigation | [Name] | [Date] | Pass/Fail |
| Screen Reader | [Name] | [Date] | Pass/Fail |
| Contrast Verification | [Name] | [Date] | Pass/Fail |

**Final Approval**: [ ] Accessibility review complete. Ready for merge.
