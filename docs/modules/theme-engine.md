---
title: CRT Retro Themes & CSS Engine
module: theme-engine.js
path: src/modules/theme-engine.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 🎨 `theme-engine.js` — CRT Theme & Palette Engine

Manages retro phosphor themes, CSS Custom Properties injection, and vintage CRT display shaders.

---

## 1. Overview & Architecture

* **Theme Presets**:
  - `default`: Master retro Obsidian palette.
  - `amber`: Amber CRT monochrome (`#FFB000`).
  - `green`: Green phosphor matrix (`#33FF33`).
  - `c64`: Commodore 64 cyan/blue (`#7068EB`).
* **Dynamic Variables**: Injects `--accent-color`, `--accent-glow`, `--bg-primary` into `document.documentElement`.
* **CRT Shaders**: Toggles scanlines, CRT flicker, and glass vignette curves.
* **Storage**: Synchronizes preferences to `localStorage['arcade_theme_settings']`.

---

## 2. Exported / Internal Functions

* `setTheme(themeName)`: Activates named theme preset.
* `setAccentColor(hexCode)`: Injects custom accent color dynamically.
* `toggleScanlines(enabled)`: Toggles CRT scanline shader overlay.
