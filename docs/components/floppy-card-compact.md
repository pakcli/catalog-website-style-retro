---
title: Floppy Card Mobile Compact View
component: floppy-card-compact
type: card
width: 24 cols
selector: .floppy-card.grid-view
---

# 📱 Floppy Card — Mobile Compact View (`floppy-card-compact`)

Ultra-compact vertical card atom designed for 2-column mobile portrait layouts without horizontal overflow.

---

## 1. Monospace ASCII Wireframe

```text
┌──────────────────────┐  ┌──────────────────────┐
│ Unit Circle [ PIN ]  │  │ Modular Slidev       │
├──────────────────────┤  ├──────────────────────┤
│ [ CRT Thumbnail    ] │  │ [ CRT Thumbnail    ] │
│ (MATH & CANVAS)      │  │ (SLIDEV & DOCS)      │
│ 6.8 KB               │  │ 16.4 KB              │
├──────────────────────┤  ├──────────────────────┤
│ [ ⬇ DL ]  [ ↗ Open ] │  │ [ ⬇ DL ]  [ ↗ Open ] │
└──────────────────────┘  └──────────────────────┘
```

---

## 2. Component Anatomy

* **Width Budget**: Strictly **24 characters width** per card (allowing two cards to fit comfortably side-by-side on 50–60 character mobile screens).
* **Header**: Title truncated to 12 characters + compact `[ PIN ]` button.
* **Aspect Ratio**: 16:9 compact CRT preview image slot.
* **Footer Controls**: Condensed icon-driven buttons `[ ⬇ DL ]` and `[ ↗ Open ]`.

---

## 3. CSS Classes & Rules

* **Class**: `.floppy-card.grid-view`, `.card-compact`
* **Rule #2 Enforced**: Flex grid with `gap: 8px` and auto-scaling percentage widths (`calc(50% - 4px)`).
