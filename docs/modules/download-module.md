---
title: In-Browser Standalone HTML Exporter
module: download-module.js
path: src/modules/download-module.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 💾 `download-module.js` — Standalone Downloader

In-browser asset bundler that packages HTML, CSS, and JS into single-file self-contained `.html` files for offline execution.

---

## 1. Overview & Architecture

* **Zero-Server Packaging**: Fetches app source, inlines external `<link rel="stylesheet">` and `<script src="...">` tags into inline blocks.
* **Blob Pipeline**: Emits in-memory `Blob` of type `application/octet-stream`.
* **Trigger Mechanism**: Dynamically creates a temporary hidden `<a download="app.html">` element and programmatically executes a click.

---

## 2. Exported / Internal Functions

* `downloadStandaloneApp(slug)`: Fetches cartridge assets, bundles them into one file, and triggers browser download.
* `bundleInlinedHtml(rawHtml, baseUrl)`: Inlines stylesheets and scripts into a self-contained string.
