---
title: UI Components Monospace Wireframe Catalog
category: UIUX & WIREFRAME
scope: [components, wireframe, style]
status: active
version: 2.1.0
---

# 📐 UI Components Reference (`docs/components`)

This document provides atomic specifications and monospace text ASCII wireframes for all UI components and layout elements in `src/components/`, `src/style/`, and `src/modules/`.

In compliance with [`all-lads-tool/skill/uiux-wireframe-via-text-ascii-codeblock.md`](file:///d:/0pro/fadhlisl-my-id/all-lads-tool/skill/uiux-wireframe-via-text-ascii-codeblock.md):
* **Strict Monospace Boundary Alignment**: Every bordered box is a closed rectangle with identical character length.
* **Rule #2 Budget Enforced**: All atomic component wireframes are budgeted at **<= 50–54 characters width** (mobile portrait safe, 0 horizontal scroll).
* **Zero Wide Emojis in Borders**: Text glyphs (`[*]`, `[+]`, `[x]`, `>`, `v`) are used instead of wide emojis to prevent variable font-width breaking.

---

## 📑 Component Catalog Index

1. [Floppy Hero Header (`.floppy-hero`)](#1-floppy-hero-header-floppy-hero)
2. [Floppy Disk Cartridge Card — Desktop Detail View (`.floppy-card`)](#2-floppy-card--desktop-detail-view)
3. [Floppy Disk Cartridge Card — Mobile Compact View (`.floppy-card-compact`)](#3-floppy-card--mobile-compact-view)
4. [Accent Picker Modal Dialog (`accent-picker-modal.js`)](#4-accent-picker-modal-dialog)
5. [Winget Quick Nav CLI Pod (`winget.js`)](#5-winget-quick-nav-cli-pod)
6. [Bento Layout 60/40 Split Sandbox Dock](#6-bento-layout-6040-split-sandbox-dock)
7. [Breadcrumb Trail Navigation (`breadcrumb.js`)](#7-breadcrumb-trail-navigation)
8. [Slidev Dual-Column Slide Layout](#8-slidev-dual-column-slide-layout)
9. [CRT Screen Shader & Scanline Overlay](#9-crt-screen-shader--scanline-overlay)

---

## 1. Floppy Hero Header (`.floppy-hero`)

Physical 3.5" floppy disk silhouette with a 45-degree corner-cut on the top right.

* **CSS Selector**: `.floppy-hero`, `.hero-cornercut`
* **Width**: 50 columns
* **Behaviors**: Single-line responsiveness, dynamic cartridge count, local WIB clock, accent trigger.

```text
┌────────────────────────────────────────────────\
│ VINTAGE COMPUTING ARCADE          (45deg Cut)   \
├─────────────────────────────────────────────────┤
│ [*] 7 Apps  |  [+] 02:11 WIB  |  [o] Accent     │
└─────────────────────────────────────────────────┘
```

---

## 2. Floppy Card — Desktop Detail View

Horizontal single-row card rendering for wide desktop browsing.

* **CSS Selector**: `.floppy-card.detail-view`
* **Width**: 50 columns
* **Elements**: CRT thumbnail slot, sector badge, pin toggle, size indicator, direct action buttons.

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

## 3. Floppy Card — Mobile Compact View

Vertical 2-column card atom designed for mobile viewports to prevent horizontal overflow (**Rule #2**).

* **CSS Selector**: `.floppy-card.grid-view`
* **Width**: 24 columns (two fit side-by-side on 50-col screens)

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

## 4. Accent Picker Modal Dialog

Retro phosphor palette switcher rendered by `src/components/accent-picker-modal.js`.

* **CSS Selector**: `.accent-modal`, `.palette-grid`
* **Width**: 50 columns
* **Elements**: Preset swatch toggles, custom hex input, apply and reset buttons.

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

## 5. Winget Quick Nav CLI Pod

Standalone floating retro command pod spawned via `Ctrl + K` or double-shift (`src/modules/winget.js`).

* **CSS Selector**: `.winget-pod`, `.winget-input`
* **Width**: 50 columns
* **Elements**: Draggable bar, search prompt, highlighted suggestion, keycap hints.

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

## 6. Bento Layout 60/40 Split Sandbox Dock

Responsive dual-panel workbench for running live cartridges alongside code/slide inspectors (`src/modules/playground.js`).

* **CSS Selector**: `.bento-container`, `.sandbox-panel`, `.dock-panel`
* **Width**: 50 columns
* **Desktop**: 60% Left Sandbox / 40% Right Inspector.
* **Mobile**: Automatically stacks vertically with zero horizontal scroll.

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

## 7. Breadcrumb Trail Navigation

Monospace segmented path navigator (`src/modules/breadcrumb.js`).

* **CSS Selector**: `.breadcrumb-nav`, `.crumb-segment`
* **Width**: 50 columns
* **Elements**: Active path indicators, root jump link, responsive truncate on mobile.

```text
┌────────────────────────────────────────────────┐
│ [ ROOT ] > [ APPS ] > [ radiansincostan ]      │
└────────────────────────────────────────────────┘
```

---

## 8. Slidev Dual-Column Slide Layout

Two-column presentation slide parsed by `src/modules/slidev-engine.js` using `::right::` delimiter.

* **CSS Selector**: `.slide-two-cols`, `.col-left`, `.col-right`
* **Width**: 50 columns

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

## 9. CRT Screen Shader & Scanline Overlay

Hardware-accelerated CSS filter stack providing vintage monitor optics.

* **CSS Selector**: `.crt-overlay`, `.scanlines`, `.phosphor-glow`
* **Width**: 50 columns
* **Effects**:
  - Horizontal scanline banding via linear-gradient repeat.
  - Phosphor bloom via `filter: drop-shadow(0 0 4px var(--accent-glow))`.
  - Subtle spherical screen vignette via radial-gradient.

```text
┌────────────────────────────────────────────────┐
│ ############################################## │ <- Scanline 1
│                                                │
│ ############################################## │ <- Scanline 2
│           CRT SCREEN VIGNETTE CURVE            │
│ ############################################## │ <- Scanline 3
└────────────────────────────────────────────────┘
```
