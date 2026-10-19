---
title: Presentation Timeline Scrubbing Bar
module: breadscrub.js
path: src/modules/breadscrub.js
target: page-playground.js
status: active
version: 2.1.0
---

# ⏳ `breadscrub.js` — Presentation Scrubbing Bar

Compact slide timeline scrubber positioned beneath Slidev presentations for rapid slide navigation.

---

## 1. Overview & Architecture

* **Interactive Timeline**: Click-and-drag scrubbing control reflecting presentation progress.
* **Instant Jump**: Dispatches slide transition events upon scrub release.
* **Tooltip Previews**: Shows slide title on cursor hover over scrub notches.

---

## 2. Exported / Internal Functions

* `initBreadscrub(totalSlides, onChangeCallback)`: Mounts scrubber with total step count.
* `updateScrubPosition(currentSlideIndex)`: Synchronizes progress indicator bar.
