---
title: Winget Quick Nav CLI Pod
component: winget-pod
type: modal-pod
width: 50 cols
selector: .winget-pod
---

# 🚀 Winget Quick Nav CLI Pod (`winget-pod`)

Draggable, floating terminal command launcher overlay spawned via `Ctrl + K` or double-shift (`src/modules/winget.js`).

---

## 1. Monospace ASCII Wireframe

```text
┌─ WINGET CLI QUICK NAV ───────────────────[ - ][X]┐
│ > search cartridge or jump to sector...        │
├────────────────────────────────────────────────┤
│ > 1. radiansincostan      [MATH & CANVAS]      │
│   2. vibe-arcade-deck     [SLIDEV & DOCS]      │
│   3. lotek-offline        [WEB & WHATSAPP]     │
│   4. wa-parser            [UTILITY & TEXT]     │
├────────────────────────────────────────────────┤
│ [Up/Down] Select   [Enter] Launch   [Esc] Exit │
└────────────────────────────────────────────────┘
```

---

## 2. Component Anatomy

* **Title Bar**: Draggable handle with minimize `[ - ]` and close `[ X ]` controls.
* **Search Prompt**: Live terminal input `> search...` with instant fuzzy filtering.
* **Result List**: Indexed matching cartridges showing slug, category badge, and keyboard pointer `>`.
* **Footer Status**: Keyboard navigation cheatsheet.

---

## 3. CSS Classes & Rules

* **Class**: `.winget-pod`, `.winget-input`, `.winget-result-item`
* **Z-Index**: `9999` (stays on top of sandboxes and iframes).
