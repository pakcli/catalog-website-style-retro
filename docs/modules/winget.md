---
title: Standalone Floating Quick Nav Pod
module: winget.js
path: src/modules/winget.js
target: winget.js (standalone)
status: active
version: 2.1.0
---

# 🚀 `winget.js` — Floating CLI Command Pod

Zero-dependency floating terminal modal for rapid keyboard-driven navigation (`Ctrl + K`).

---

## 1. Overview & Architecture

* **Global Shortcut**: Listens for `Ctrl + K` or double-shift tap anywhere on the page.
* **Fuzzy Filtering**: Filters available cartridges and jump targets in real time.
* **Keyboard Navigation**: Supports `ArrowUp`, `ArrowDown`, `Enter` (launch), and `Escape` (dismiss).
* **Draggable Window**: Custom draggable header bar allowing repositioning around the screen.

---

## 2. Exported / Internal Functions

* `initWingetPod()`: Attaches global event listeners and injects floating DOM container.
* `openWinget()` & `closeWinget()`: Toggles pod visibility state.
* `filterCommands(query)`: Fuzzy-matches query against cartridge catalog.
