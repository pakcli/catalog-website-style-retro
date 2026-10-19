---
title: Tactile Terminal Breadcrumb Navigation
module: breadcrumb.js
path: src/modules/breadcrumb.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 🧭 `breadcrumb.js` — Breadcrumb Navigation Trail

Monospace retro terminal navigation trail (`ROOT > APPS > [SLUG]`).

---

## 1. Overview & Architecture

* **Hierarchical Segments**: Generates clickable crumbs based on URL parameters and page depth.
* **Mobile Constraint (Rule #2)**: Automatically truncates intermediate path segments on small viewports ($\le 480\text{px}$) to avoid horizontal overflow.
* **Accessibility**: Implements keyboard focus states and ARIA breadcrumb landmarks.

---

## 2. Exported / Internal Functions

* `renderBreadcrumbs(trailArray)`: Injects segmented DOM elements into breadcrumb container.
* `updateActiveCrumb(leafTitle)`: Updates title of the current active cartridge leaf.
