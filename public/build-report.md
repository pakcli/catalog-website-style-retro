---
version-build: 2.1.0
version-build-by: agent
note: Core production build report with standalone bundling, zero-ID compliance, Playwright preview audits, and CSV metrics.
commit:
  feat:
    - Standalone core build engine (src/modules/build-bundle.js)
    - Apps brief using Markdown headings format with 3 openable files per app
  chore:
    - Obsidian-compatible wikilink frontmatter properties (img: [[light.webp]], [[dark.webp]])
    - Split audit tables into core and detailed CSV metrics
  remove:
    - Hardcoded all-lads-tool dependency from core build engine
---

# 🕹️ Vintage Computing Arcade — Production Build Report

## 📝 1. Architectural Brief & Build Overview
* **Project**: Vintage Computing Arcade (`fadhlisl-my-id`)
* **Timestamp**: `2026-11-09T16:21:10.390Z`
* **Duration**: `101 ms`
* **Build Engine**: `src/modules/build-bundle.js` (100% Standalone Core, Zero-Backend)
* **Architecture Rules**:
  * **Rule #1 (Theme Immutability)**: `theme.css` (Original Obsidian Theme) is preserved with **0 edits / 100% byte fidelity**.
  * **Rule #2 (Mobile Zero Horizontal Scroll)**: `overflow-x: clip` enforced across all viewports.
  * **Rule #3 (Zero Hardcoded Variables)**: Dynamic resolution via relative paths and manifest configuration.
  * **Zero-ID Standard**: Slugs derived strictly from basenames.

---

## 🕹️ 2. Standalone Apps & Cartridges Brief

### 1. Plumbing Architecture & Inventory (`plumbing-arcitecture-inventory`)
* **Category / Sector**: `TOOLS & UTILITY` (`tools`)
* **Overview**: Interactive plumbing architecture, flow topology, part inventory, and automated procurement Bill of Materials (BOM) engine.
* **Obsidian Frontmatter `img`**: `[[img-lightmode.webp]], [[img-darkmode.webp]]`
* **Direct Openable Artifacts (3 Files)**:
  1. 🌐 **Standalone HTML App**: [plumbing-arcitecture-inventory.html](apps/plumbing-arcitecture-inventory.html)
  2. ☀️ **Playwright Light Mode Preview**: [img-lightmode.webp](apps/plumbing-arcitecture-inventory/img-lightmode.webp)
  3. 🌙 **Playwright Dark Mode Preview**: [img-darkmode.webp](apps/plumbing-arcitecture-inventory/img-darkmode.webp)
  *(Source Markdown: [plumbing-arcitecture-inventory.md](apps/plumbing-arcitecture-inventory.md))*

### 2. Unit Circle Resolver (`radiansincostan`)
* **Category / Sector**: `MATH & CANVAS` (`edu`)
* **Overview**: Interactive trigonometric unit circle calculator. Drag dynamic angle point to solve real-time sin, cos, and tan with exact radical fractions.
* **Obsidian Frontmatter `img`**: `[[img-lightmode.webp]], [[img-darkmode.webp]]`
* **Direct Openable Artifacts (3 Files)**:
  1. 🌐 **Standalone HTML App**: [radiansincostan.html](apps/radiansincostan.html)
  2. ☀️ **Playwright Light Mode Preview**: [img-lightmode.webp](apps/radiansincostan/img-lightmode.webp)
  3. 🌙 **Playwright Dark Mode Preview**: [img-darkmode.webp](apps/radiansincostan/img-darkmode.webp)
  *(Source Markdown: [radiansincostan.md](apps/radiansincostan.md))*


---

## 🎯 3. Five Core Build Sizes

| Metric | Size (KB) | Duration (MS) | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **[1] `src`** | **817.01 KB** | - | Raw source code in `src/` | Uncompiled Source |
| **[2] `apps`** | **463.43 KB** | - | Standalone cartridges in `apps/` | Isolated Apps |
| **[3] `build without apps uncompacted`** | **2181.89 KB** | 101 ms | Core platform runtime in `public/` | Core Distribution |
| **[4] `build with apps uncompacted`** | **2585.1 KB** | 101 ms | Total distribution including apps in `public/` | Raw Distribution |
| **[5] `build with apps compacted`** | **2559.12 KB** | 101 ms | Total compacted distribution in `public/` | **Optimized Output** |

---

## 🏗️ 4. Build Architecture Flow (ASCII Diagram)

```text
===================================================================================
                       RAW SOURCES (src/ & apps/)
  [src/modules/*.js] (379 KB)      [src/style/*.css] (180 KB)      [apps/*] (494 KB)
===================================================================================
             |                                 |                          |
             |  Concatenation & Routing        |  Combine & Scope         |  Cartridge CSR
             v                                 v                          v
+---------------------------------------------------------------------------------+
|                       COMPILED BUNDLES (public/)                                |
|  -> page-apps.js       (12 modules: Catalog, Navigation, Markdown, Downloader)  |
|  -> page-playground.js (12 modules: Dual-panel sandbox, Slidev, Speech, TTS)    |
|  -> winget.js          (Standalone Floating Quick Nav Pod)                      |
|  -> theme.css          (Verbatim Obsidian Retro Theme -- RULE #1 SAFE)          |
|  -> style.css          (Combined Floppy cut + Terminal cursor + Winget modals)  |
|  -> public/apps/*      (Standalone HTMLs, WebP thumbnails, _catalog.json)       |
+---------------------------------------------------------------------------------+
                                       |
                                       |  Terser / Regex Compaction & Strip
                                       v
===================================================================================
                  FINAL COMPACTED DISTRIBUTION (public/)
   Total Distribution: 2559.12 KB | Zero-Backend Ready | 100% Airgap Static
===================================================================================
```

---

## 📊 5. Build Audit CSV Tables

### 🎯 5.1 Core Metrics Table
![[build-report-table-core.csv]]

### 📋 5.2 Detailed Payload Audit Table
![[build-report-table-detailed.csv]]

---

## 📋 6. Detailed Payload Audit Table

| File Name | Source / Type | Compiled | Compacted | Reduction |
| :--- | :--- | :--- | :--- | :--- |
| `apps/plumbing-arcitecture-inventory/index.md` | 2.13 KB (source md) | 2.13 KB | 0 KB | source-only |
| `apps/plumbing-arcitecture-inventory/index_catalog.json` | 1.11 KB (csr) | 1.11 KB | 1.11 KB | -0.0% |
| `apps/plumbing-arcitecture-inventory/index.html` | 66.91 KB | 66.91 KB | 66.91 KB | -0.0% |
| `apps/radiansincostan/index.md` | 2.55 KB (source md) | 2.55 KB | 0 KB | source-only |
| `apps/radiansincostan/index_catalog.json` | 0.95 KB (csr) | 0.95 KB | 0.95 KB | -0.0% |
| `apps/radiansincostan/index.html` | 158.60 KB | 158.6 KB | 158.6 KB | -0.0% |
| `apps/radiansincostan/img.webp` | 46.29 KB | 46.29 KB | 46.29 KB | -0.0% |
| `apps/radiansincostan/img-darkmode.webp` | 46.29 KB | 46.29 KB | 46.29 KB | -0.0% |
| `apps/radiansincostan/img-lightmode.webp` | 44.84 KB | 44.84 KB | 44.84 KB | -0.0% |
| `apps/_catalog.json` | 2.17 KB (catalog) | 2.17 KB | *merged* | -0.0% |
| `main.js` | 48.68 KB | 48.68 KB | 48.68 KB | -0.0% |
| `theme.css` | 90.98 KB | 90.98 KB | 90.98 KB | -0.0% |
| `style.css` | 77.79 KB | 77.79 KB | *merged* | -26.6% |
| `apps/index.html` | 12.34 KB | 12.34 KB | 12.3 KB | -0.3% |
| `index.html` | 15.41 KB (home hub) | 15.41 KB | 14.83 KB | -3.8% |

---

> [!NOTE]
> **RULE #1 VERIFICATION**: `theme.css` byte length = `93159` bytes. Matched upstream Obsidian theme verbatim with zero mutations.
