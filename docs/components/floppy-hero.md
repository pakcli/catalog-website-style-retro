---
title: Floppy Hero Header
component: floppy-hero
type: atom
width: 50 cols
selector: .floppy-hero
---

# 💾 Floppy Hero Header (`floppy-hero`)

Physical 3.5" floppy disk silhouette header with a 45-degree corner-cut on the top-right edge.

---

## 1. Monospace ASCII Wireframe

```text
┌────────────────────────────────────────────────\
│ VINTAGE COMPUTING ARCADE          (45deg Cut)   \
├─────────────────────────────────────────────────┤
│ [*] 7 Apps  |  [+] 02:11 WIB  |  [o] Accent     │
└─────────────────────────────────────────────────┘
```

---

## 2. Component Anatomy

* **Top Border**: Closed single-line box with top-right diagonal glyph `\` simulating floppy cornercut.
* **Title Bar**: Monospace project branding aligned to the left.
* **Status Divider**: Horizontal line separator `├──────┤`.
* **Telemetry Bar**:
  - `[*] 7 Apps`: Dynamic count of loaded cartridges.
  - `[+] 02:11 WIB`: Live digital clock synchronized to WIB timezone.
  - `[o] Accent`: Interactive trigger button opening the Accent Palette Modal.

---

## 3. CSS Classes & Rules

* **Class**: `.floppy-hero`, `.hero-cornercut`
* **Mobile Constraint (Rule #2)**: Uses `flex-wrap: wrap` and collapses telemetry items into 2 rows on screens $\le 360\text{px}$, keeping horizontal width strictly within viewport boundaries.
