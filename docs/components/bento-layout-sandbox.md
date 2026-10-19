---
title: Bento Layout 60/40 Split Sandbox Dock
component: bento-layout-sandbox
type: layout
width: 50 cols
selector: .bento-container
---

# 🍱 Bento Layout 60/40 Sandbox Dock (`bento-layout-sandbox`)

Responsive dual-panel workbench for running live cartridges alongside code and slide inspectors (`src/modules/playground.js`).

---

## 1. Monospace ASCII Wireframe

```text
┌──────────────────────────┬─┬───────────────────┐
│ LIVE SANDBOX (60%)       │║│ CODE DOCK (40%)   │
│ ┌──────────────────────┐ │║│ [ Slidev | MD ]   │
│ │ <iframe sandbox>     │ │║│ # Unit Circle     │
│ │                      │ │║│ Interactive math  │
│ │                      │ │║│ engine overview.  │
│ └──────────────────────┘ │║│                   │
│ [ Reload ] [ Fullscr ]   │║│ [ < Prev ] [ > ]  │
└──────────────────────────┴─┴───────────────────┘
```

---

## 2. Component Anatomy

* **Left Panel (60% Width)**: Isolated iframe running the standalone HTML cartridge with reload and fullscreen buttons.
* **Vertical Split Gutter (`║`)**: Subtle border separating sandbox and documentation.
* **Right Panel (40% Width)**: Tabbed dock toggling between Slidev presentation view and raw Markdown source.

---

## 3. Responsive Rules

* **Desktop View**: CSS Grid `grid-template-columns: 60fr 40fr`.
* **Mobile Portrait (Rule #2)**: Auto-collapses into vertical stack (`100%` width per panel) with zero horizontal overflow.
