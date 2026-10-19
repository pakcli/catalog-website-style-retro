---
title: Breadcrumb Trail Navigation
component: breadcrumb-nav
type: atom
width: 50 cols
selector: .breadcrumb-nav
---

# 🧭 Breadcrumb Trail Navigation (`breadcrumb-nav`)

Monospace segmented path navigator rendered by `src/modules/breadcrumb.js`.

---

## 1. Monospace ASCII Wireframe

```text
┌────────────────────────────────────────────────┐
│ [ ROOT ] > [ APPS ] > [ radiansincostan ]      │
└────────────────────────────────────────────────┘
```

---

## 2. Component Anatomy

* **Root Segment**: Clickable anchor pointing to homepage / catalog.
* **Category / Directory Segment**: Points to active sector or collection.
* **Active Leaf Segment**: Monospace slug of the active application.

---

## 3. Responsive Rules

* **Mobile Portrait (Rule #2)**: Automatically collapses middle segments into `...` when total character length exceeds screen width, keeping line height and horizontal overflow strictly contained.
