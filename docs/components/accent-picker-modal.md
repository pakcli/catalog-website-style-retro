---
title: Accent Picker Modal Dialog
component: accent-picker-modal
type: modal
width: 50 cols
selector: .accent-modal
---

# 🎨 Accent Picker Modal Dialog (`accent-picker-modal`)

Interactive retro phosphor palette selector dialog component managed by `src/components/accent-picker-modal.js`.

---

## 1. Monospace ASCII Wireframe

```text
┌─ PALETTE & ACCENT SELECTOR ───────────────[ X ]┐
│ Choose active terminal phosphor hue:           │
│                                                │
│  (*) AMBER (#FFB000)      ( ) GREEN (#33FF33)  │
│  ( ) CYAN  (#00FFFF)      ( ) PAPER (#D8D0C5)  │
│                                                │
│ Custom Hex: [ #B0A84A       ]                  │
├────────────────────────────────────────────────┤
│ [ Reset Default ]                    [ Apply ] │
└────────────────────────────────────────────────┘
```

---

## 2. Component Anatomy

* **Modal Header**: Terminal window title with `[ X ]` dismiss button.
* **Palette Swatches Grid**: Radio selections for retro phosphor presets (Amber, Green, Cyan, Retro Paper).
* **Custom Hex Input**: Monospace input box accepting custom hex color codes.
* **Action Footer**: `[ Reset Default ]` restores `#B0A84A`, and `[ Apply ]` immediately injects CSS variables into `:root`.

---

## 3. CSS Classes & Rules

* **Class**: `.accent-modal`, `.palette-grid`, `.swatch-radio`
* **Injected Variables**: `--accent-color`, `--accent-glow`.
