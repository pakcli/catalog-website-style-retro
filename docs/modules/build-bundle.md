---
title: Standalone Core Build & Compaction Engine
module: build-bundle.js
path: src/modules/build-bundle.js
target: node
status: core-engine
version: 2.1.0
---

# ⚙️ `build-bundle.js` — Standalone Core Build Engine

Core build engine compiling raw source files (`src/` and `apps/`) into production-ready distribution bundles in `public/`.

---

## 1. Overview & Architecture

* **Zero Luxury Dependency**: Operates independently of `all-lads-tool/` (100% self-contained Node.js script).
* **Rule #1 Preserved**: Verifies verbatim byte length of `theme.css` (`90,924 bytes`) with zero modifications.
* **Outputs**:
  - `public/page-apps.js` (Catalog bundle)
  - `public/page-playground.js` (Sandbox bundle)
  - `public/winget.js` (Standalone Quick Nav Pod)
  - `public/apps/_catalog.json` & `apps/_catalog.json`
  - `public/build-audit.csv` & `build-audit.csv`
  - `public/BUILD_REPORT.md` & `BUILD_REPORT.md`

---

## 2. Key Execution Steps

1. **Step 1**: Compile root `apps/*.md` into JSON catalog records and standalone HTML shells.
2. **Step 2**: Concatenate and compact client JS bundles using Terser / regex compaction.
3. **Step 3**: Bundle scoped stylesheets (`style.css`, `terminal.css`, `winget.css`, `theme.css`).
4. **Step 4**: Compile production HTML shells (`page-apps.html`, `page-playground.html`, `winget.html`, `index.html`).
5. **Step 5**: Pass-through static assets.
6. **Step 6**: Calculate 4 Core Sizes and generate CSV and Markdown audit reports.

---

## 3. Usage

```powershell
node src/modules/build-bundle.js
```
