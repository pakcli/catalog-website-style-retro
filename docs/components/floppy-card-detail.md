---
title: Floppy Card Desktop Detail View
component: floppy-card-detail
type: card
width: 50 cols
selector: .floppy-card.detail-view
---

# 🗂️ Floppy Card — Desktop Detail View (`floppy-card-detail`)

Horizontal single-row card rendering for rich desktop catalog browsing.

---

## 1. Monospace ASCII Wireframe

```text
┌────────────────────────────────────────────────┐
│ Unit Circle Resolver                [ PINNED ] │
├────────────────────────────────────────────────┤
│ [ CRT Thumbnail ]  Interactive math solver for │
│ [ 120 x 80 px   ]  sin, cos, and tan vectors.  │
├────────────────────────────────────────────────┤
│ (MATH & CANVAS)    [ 6.8 KB ]    [ #SVG #Math ]│
│ [ ⬇ Download ]               [ ↗ Open Live ]   │
└────────────────────────────────────────────────┘
```

---

## 2. Component Anatomy

* **Header**: App title aligned left, dynamic `[ PINNED ]` / `[ PIN ]` toggle button aligned right.
* **Body Slot**:
  - Left: 120x80px CRT thumbnail slot with phosphor scanline overlay.
  - Right: Two-line app summary description.
* **Footer Metadata**: Sector badge (`MATH & CANVAS`), file size pill (`6.8 KB`), and tag list.
* **Action Strip**: Primary `[ ⬇ Download ]` button and `[ ↗ Open Live ]` sandbox trigger.

---

## 3. CSS Classes & Rules

* **Class**: `.floppy-card.detail-view`, `.card-thumbnail`, `.card-actions`
* **Pin State**: Toggling `.pinned` applies an accent border glow and elevates the card to top position.
