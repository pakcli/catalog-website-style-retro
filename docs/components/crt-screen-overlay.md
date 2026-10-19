---
title: CRT Screen Shader & Scanline Overlay
component: crt-screen-overlay
type: effect
width: 50 cols
selector: .crt-overlay
---

# 📺 CRT Screen Shader & Scanline Overlay (`crt-screen-overlay`)

Hardware-accelerated CSS filter stack providing vintage monitor optics across all viewports.

---

## 1. Monospace ASCII Wireframe

```text
┌────────────────────────────────────────────────┐
│ ############################################## │ <- Scanline 1
│                                                │
│ ############################################## │ <- Scanline 2
│           CRT SCREEN VIGNETTE CURVE            │
│ ############################################## │ <- Scanline 3
└────────────────────────────────────────────────┘
```

---

## 2. Component Anatomy

* **Scanlines**: Repeating horizontal pixel bands generated via `repeating-linear-gradient`.
* **Phosphor Bloom**: Soft glowing aura applied with `drop-shadow(0 0 4px var(--accent-glow))`.
* **Vignette Curve**: Radial shading darkening screen corners to simulate convex CRT glass.

---

## 3. CSS Classes & Rules

* **Class**: `.crt-overlay`, `.scanlines`, `.phosphor-glow`
* **Performance**: Uses `pointer-events: none` and GPU compositing layer (`will-change: transform`).
