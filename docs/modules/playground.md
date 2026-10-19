---
title: Bento 60/40 Dual-Panel Sandbox Runner
module: playground.js
path: src/modules/playground.js
target: page-playground.js
status: active
version: 2.1.0
---

# 🎮 `playground.js` — Bento 60/40 Sandbox Runner

Orchestrates the dual-panel interactive workbench loading live cartridges alongside source code and Slidev decks.

---

## 1. Overview & Architecture

* **Layout Split**: 60% Left Sandbox Canvas / 40% Right Documentation Dock.
* **Iframe Sandbox**: Spawns isolated iframe pointing to `apps/<slug>.html`.
* **Dock Tabs**:
  - `Markdown`: Renders documentation via `markdown-processor.js`.
  - `Slidev`: Mounts interactive presentation deck via `slidev-engine.js`.
* **Bi-Directional Bridge**: Dispatches `postMessage` events for live reloading and parameter injection.

---

## 2. Exported / Internal Functions

* `initPlayground()`: Reads URL parameters (`?app=<slug>`) and loads cartridge.
* `reloadApp()`: Refreshes active sandbox iframe.
* `toggleFullscreen()`: Expands sandbox canvas to full browser viewport.
