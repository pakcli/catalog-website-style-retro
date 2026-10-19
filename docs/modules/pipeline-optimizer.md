---
title: Resource Preloader & Asset Pipeline Optimizer
module: pipeline-optimizer.js
path: src/modules/pipeline-optimizer.js
target: page-apps.js
status: active
version: 2.1.0
---

# ⚡ `pipeline-optimizer.js` — Pipeline Optimizer

Client-side asset prefetching, cache warming, and lazy loading coordinator.

---

## 1. Overview & Architecture

* **Hover Prefetching**: Preloads WebP previews and cartridge HTML upon link/card mouse hover.
* **Intersection Observer**: Lazily loads heavy offscreen card thumbnails.
* **Cache Warming**: Stores fetched assets in browser HTTP memory cache for 0ms transitions.

---

## 2. Exported / Internal Functions

* `initOptimizer()`: Observes cards for viewport intersection.
* `prefetchCartridge(slug)`: Injects `<link rel="prefetch">` for target cartridge HTML and thumbnails.
