---
title: Slidev Dual-Column Slide Layout
component: slidev-deck-layout
type: layout
width: 50 cols
selector: .slide-two-cols
---

# 📑 Slidev Dual-Column Slide Layout (`slidev-deck-layout`)

Two-column presentation slide layout parsed and mounted by `src/modules/slidev-engine.js`.

---

## 1. Monospace ASCII Wireframe

```text
┌────────────────────────┬───────────────────────┐
│ Column 1: Concepts     │ Column 2: Architecture│
│ - FNV-1a Hash Cache    │ ┌───────────────────┐ │
│ - Virtual 3-Slide DOM  │ │ Check *.html      │ │
│ - 60 FPS locked render │ │ Serve or compile  │ │
│                        │ └───────────────────┘ │
└────────────────────────┴───────────────────────┘
```

---

## 2. Component Anatomy

* **Left Column**: Concept points, bullets, and explanations.
* **Right Column (`::right::`)**: Monospace architecture wireframes, code blocks, or diagrams.

---

## 3. Responsive Rules

* **Desktop**: Side-by-side columns (`grid-template-columns: 1fr 1fr`).
* **Mobile (Rule #2)**: Auto-stacks columns vertically with no side-scrolling.
