---
title: Client-Side Markdown Processor
module: markdown-processor.js
path: src/modules/markdown-processor.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 📝 `markdown-processor.js` — Client Markdown Processor

Zero-dependency in-browser Markdown parser converting documentation and slide source into clean HTML.

---

## 1. Overview & Architecture

* **Zero-Backend**: Parses GitHub Flavored Markdown (GFM) client-side without third-party CDN bundles.
* **Special Codeblock Hooks**:
  - ````wireframe` & ````text`: Preserves monospace ASCII box-drawing characters without font distortion.
  - ````js run`: Injects interactive `[ ▶ Run Code ]` buttons allowing live JavaScript execution.
* **Obsidian Wikilink Parser**: Detects `[[filename.webp]]` links and renders them as interactive preview thumbnails.

---

## 2. Exported / Internal Functions

* `renderMarkdown(mdText)`: Converts raw Markdown string into sanitized HTML.
* `extractFrontmatter(mdText)`: Extracts YAML frontmatter key-value pairs.
