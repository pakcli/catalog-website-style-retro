---
title: Hybrid Slidev Presentation Deck Engine
module: slidev-engine.js
path: src/modules/slidev-engine.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 📑 `slidev-engine.js` — Slidev Deck Engine

Zero-backend client presentation engine with content hash caching, virtual 3-slide DOM, and dual-screen presenter mode.

---

## 1. Overview & Architecture

* **Slide Delimiter**: Parses Markdown slides delimited by `---`.
* **FNV-1a 32-bit Hash**: Hashes slide content into `localStorage`; revisit loads in `< 1ms`.
* **Virtual 3-Slide DOM**: Mounts only `Prev | Active | Next` slides into the active DOM for locked 60 FPS transitions.
* **Dual-Screen Presenter Mode**: Press `[P]` to detach a synchronized speaker notes window powered by `BroadcastChannel`.

---

## 2. Exported / Internal Functions

* `initSlidev(containerEl, mdText)`: Initializes presentation deck from Markdown source.
* `nextSlide()` & `prevSlide()`: Transitions active slide with keyboard arrow support.
* `openPresenterMode()`: Launches speaker notes popout window.
