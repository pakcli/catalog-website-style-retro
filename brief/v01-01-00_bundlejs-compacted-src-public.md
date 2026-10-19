# Vintage Computing Arcade — Bundled JS, Compaction & Source-to-Public Architecture (`v01-01-01_bundlejs-compacted-src-public`)

> **Version**: `v01-01` (Consolidated Production Architecture & Build Engine Milestone)  
> **Status**: Completed & Production-Verified  
> **Repository**: `fadhlisl-my-id`  
> **Build Engine**: `src/modules/build-bundle.js` (100% Standalone Core, Zero-Backend, Zero-Toolchain Dependency)  
> **Core Philosophies**:  
> 1. **Airgap CSR**: 100% static, client-side rendered (CSR), zero-database, zero-server-side execution.
> 2. **Rule #1 (Theme Immutability)**: Master Obsidian retro theme (`theme.css`) is preserved with **0 edits / 100% byte fidelity**.
> 3. **Rule #2 (Mobile Zero Horizontal Scroll)**: Strict `overflow-x: clip` viewport boundary on all screen sizes.
> 4. **Rule #3 (Zero Hardcoded Variables)**: Pure relative resolution, zero local drive letters, dynamic path discovery.
> 5. **Source-Only Markdown**: Markdown cartridges (`apps/<slug>/index.md`) are authoring sources only; **zero `.md` files in `public/`**.
> 6. **Zero-ID Standard**: Slugs derived strictly from folder/file basenames.

---

## 📑 DAFTAR ISI (TABLE OF CONTENTS)

- [1. Executive Architectural Summary](#1-executive-architectural-summary)
- [2. Source-to-Public Directory Topology](#2-source-to-public-directory-topology)
  - [2.1 Two-Tier Layout: Source (`src/` & `apps/`) vs Target (`public/`)](#21-two-tier-layout-source-src--apps-vs-target-public)
  - [2.2 Cartridge Isolation Model](#22-cartridge-isolation-model)
  - [2.3 Source-Only Markdown Standard](#23-source-only-markdown-standard)
- [3. Standalone Core Compiler Engine (`src/modules/build-bundle.js`)](#3-standalone-core-compiler-engine-srcmodulesbuild-bundlejs)
  - [3.1 Complete Decoupling from `all-lads-tool/`](#31-complete-decoupling-from-all-lads-tool)
  - [3.2 The 5-Step Unified Build Pipeline](#32-the-5-step-unified-build-pipeline)
  - [3.3 Built-in Compaction & Minification Engines](#33-built-in-compaction--minification-engines)
  - [3.4 Interactive Build Runner (build.ps1) & Detailed Guide (build-guide.md)](#34-interactive-build-runner-buildps1--detailed-guide-build-guidemd)
- [4. Five Core Build Metrics & Dual Audit Tables](#4-five-core-build-metrics--dual-audit-tables)
  - [4.1 The Five Core Size Metrics](#41-the-five-core-size-metrics)
  - [4.2 Core Audit Table (`build-report-table-core.csv`)](#42-core-audit-table-build-report-table-corecsv)
  - [4.3 Detailed Payload Audit Table (`build-report-table-detailed.csv`)](#43-detailed-payload-audit-table-build-report-table-detailedcsv)
  - [4.4 Dual Report Deliverables (`build-report.md` vs `build-report-flat.md`)](#44-dual-report-deliverables-build-reportmd-vs-build-report-flatmd)
- [5. Client JS Bundles & Module Architecture](#5-client-js-bundles--module-architecture)
  - [5.1 Bundle 1: `public/page-apps.js` (Catalog Hub)](#51-bundle-1-publicpage-appsjs-catalog-hub)
  - [5.2 Bundle 2: `public/page-playground.js` (Bento Sandbox & Slidev)](#52-bundle-2-publicpage-playgroundjs-bento-sandbox--slidev)
  - [5.3 Bundle 3: `public/winget.js` (Floating Quick Nav Pod)](#53-bundle-3-publicwingetjs-floating-quick-nav-pod)
- [6. Bento Split-Screen 60/40 Playground & Slidev Integration](#6-bento-split-screen-6040-playground--slidev-integration)
  - [6.1 6-Cell Bento Topology](#61-6-cell-bento-topology)
  - [6.2 Slidev Presentation Engine](#62-slidev-presentation-engine)
  - [6.3 3-Stage Hybrid Text-to-Speech Engine (`tts.js`)](#63-3-stage-hybrid-text-to-speech-engine-ttsjs)
- [7. Stylesheet Compilation & Rule Invariants](#7-stylesheet-compilation--rule-invariants)
  - [7.1 RULE #1 Verification Protocol](#71-rule-1-verification-protocol)
  - [7.2 CSS Architecture: `style.css`, `terminal.css`, `winget.css`](#72-css-architecture-stylecss-terminalcss-wingetcss)
- [8. Developer Cockpit & Git Submodule Integration](#8-developer-cockpit--git-submodule-integration)
- [9. Upstream Template vs Downstream Production (File Separation Matrix)](#9-upstream-template-vs-downstream-production-file-separation-matrix)
  - [9.1 File Separation Matrix](#91-file-separation-matrix)
  - [9.2 Git Dual-Push Workflow (Zero-Script Approach)](#92-git-dual-push-workflow-zero-script-approach)
  - [9.3 Upstream Synchronization Protocol](#93-upstream-synchronization-protocol)
  - [9.4 Tradeoff Analysis: Why Use 1 Unified Repo Instead of Two?](#94-tradeoff-analysis-why-use-1-unified-repo-instead-of-two)
  - [9.5 Branch Conflict Matrix: template vs main unified vs upstream lain](#95-branch-conflict-matrix-template-vs-main-unified-vs-upstream-lain)

---

## 1. Executive Architectural Summary

`v01-01_bundlejs-compacted-src-public` consolidates the entire Vintage Computing Arcade platform into a clean, modern, zero-backend architecture.

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
                                       |  Regex & AST Compaction & Strip
                                       v
===================================================================================
                  FINAL COMPACTED DISTRIBUTION (public/)
   Total Distribution: ~1,450 KB | Zero-Backend Ready | 100% Airgap Static
===================================================================================
```

---

## 2. Source-to-Public Directory Topology

### 2.1 Two-Tier Layout: Source (`src/` & `apps/`) vs Target (`public/`)

The repository enforces a strict physical separation between developer authoring sources and distribution bundles:

```text
fadhlisl-my-id/
├── apps/                                   # Root Cartridge Sources (Isolated)
│   ├── _catalog.json                       # Root mirror of compiled catalog
│   ├── radiansincostan/                    # Math & trigonometry unit circle
│   │   ├── index.md                        # Obsidian source & YAML frontmatter
│   │   ├── index.html                      # Standalone HTML app
│   │   ├── img.webp                        # Primary visual thumbnail
│   │   ├── img-darkmode.webp               # Dark mode Playwright preview
│   │   └── img-lightmode.webp              # Light mode Playwright preview
│   └── vibe-arcade-deck/                   # Slidev interactive docs cartridge
│       ├── index.md                        # Presentation deck markdown
│       ├── index.html                      # Standalone presentation app
│       └── img*.webp                       # Desktop snapshot previews
│
├── src/                                    # Developer Source of Truth (Pure Modular)
│   ├── modules/                            # 12 Independent ES/CJS Modules
│   │   ├── build-bundle.js                 # Standalone core build engine
│   │   ├── catalog-core.js                 # Dynamic floppy catalog renderer
│   │   ├── playground.js                   # Bento 60/40 sandbox engine
│   │   ├── slidev-engine.js                # Markdown slide presentation deck
│   │   ├── speech-engine.js                # Web Speech API wrapper
│   │   ├── tts.js                          # 3-Stage bilingual TTS engine
│   │   ├── theme-engine.js                 # OKLCH accent color resolver
│   │   ├── breadcrumb.js                   # Clean breadcrumb trail renderer
│   │   ├── navigation-url.js               # Clean URL router (/playground/<app>)
│   │   ├── markdown-processor.js           # Markdown parser & syntax highlighter
│   │   ├── download-module.js              # Airgap static zip downloader
│   │   ├── pipeline-optimizer.js           # CSR rendering scheduler
│   │   └── winget.js                       # Quick navigation modal pod
│   ├── style/                              # Modular stylesheets
│   │   ├── theme/vintage-computer/theme.css # Master Obsidian Theme (RULE #1 SAFE)
│   │   ├── flopydisk-cornercut.css         # Skeuomorphic 3.5" floppy cards
│   │   ├── terminal.css                    # Retro cursor animations
│   │   └── winget.css                      # Modal dialog styles
│   ├── page-apps.html                      # Uncompiled Catalog HTML Shell
│   ├── page-playground.html                # Uncompiled Bento Playground Shell
│   ├── winget.html                         # Uncompiled Winget Shell
│   └── index.html                          # Root redirector
│
├── public/                                 # 100% Airgap Production Distribution
│   ├── apps/                               # Compiled cartridges (NO .md files)
│   │   ├── _catalog.json                   # Aggregated master catalog
│   │   ├── radiansincostan/                # Compiled index.html, index_playground.html, webp
│   │   └── vibe-arcade-deck/               # Compiled presentation, webp
│   ├── page-apps.html                      # Production Catalog Hub
│   ├── page-playground.html                # Production Bento Playground
│   ├── winget.html                         # Production Winget Modal Shell
│   ├── index.html                          # Root forwarder (-> page-apps.html)
│   ├── page-apps.js                        # Compacted Catalog Bundle (~155 KB)
│   ├── page-playground.js                  # Compacted Bento Bundle (~144 KB)
│   ├── winget.js                           # Compacted Quick Nav Pod (~23 KB)
│   ├── theme.css                           # Byte-for-byte untouched Obsidian theme
│   ├── style.css                           # Compacted master stylesheet
│   ├── terminal.css                        # Blinking cursor styles
│   └── winget.css                          # Compacted pod modal styles
│
├── all-lads-tool/                          # Git Submodule: Developer Cockpit & Rules
└── main.ps1                                # PowerShell Universal Script Dispatcher
```

### 2.2 Cartridge Isolation Model
Every app in `apps/<slug>/` is a standalone, self-contained cartridge with:
1. `index.html`: Fully functional offline without parent arcade shell.
2. `index.md`: Metadata and presentation slides.
3. `img*.webp`: Desktop viewports captured via headless Playwright.
4. `index_catalog.json`: Machine-readable cartridge profile used for CSR.

### 2.3 Source-Only Markdown Standard
* `index.md` files are **strictly authoring sources**.
* They are never copied to `public/`.
* The build engine parses frontmatter into JSON and strips any `.md` from public distribution to maintain zero bloat.

---

## 3. Standalone Core Compiler Engine (`src/modules/build-bundle.js`)

### 3.1 Complete Decoupling from `all-lads-tool/`
Per **Rule #000 (Main Rule)**, the core application build pipeline has **zero dependency** on `all-lads-tool/`. It runs on pure, vanilla Node.js using only built-in modules (`fs`, `path`).

### 3.2 The 5-Step Unified Build Pipeline
1. **[1/5] Cartridge CSR Aggregation**:
   - Discovers all subfolders in root `apps/`.
   - Strips forbidden legacy `id:` lines.
   - Extracts YAML frontmatter properties.
   - Generates `index_catalog.json` per app and master `public/apps/_catalog.json`.
   - Generates Playwright preview wrappers (`index_playground.html`).
2. **[2/5] Client JS Bundling**:
   - Assembles 3 modular bundles (`page-apps.js`, `page-playground.js`, `winget.js`).
   - Injects scope delimiters.
   - Runs JavaScript compaction engine.
3. **[3/5] Stylesheet Bundling**:
   - Copies `theme.css` with 100% byte fidelity verification.
   - Combines `flopydisk-cornercut.css`, `terminal.css`, and `winget.css` into `style.css`.
   - Runs CSS minification.
4. **[4/5] HTML Shell Compilation**:
   - Injects bundled stylesheets and scripts into `page-apps.html`, `page-playground.html`, `winget.html`, and `index.html`.
   - Minifies HTML whitespace.
5. **[5/5] Audit & Metric Generation**:
   - Calculates the 5 core directory sizes.
   - Outputs dual CSV tables and dual Markdown reports.
   - Updates `build.json` with live timestamped metrics.

### 3.3 Built-in Compaction & Minification Engines
* **JavaScript Compactor**: Strips multi-line comment blocks (`/* ... */`), single-line comments (`// ...`), collapses duplicate blank lines, and trims trailing whitespace.
* **CSS Minifier**: Strips comment blocks, collapses whitespace around `:`, `{`, `}`, `;`, and removes trailing semicolons.
* **HTML Minifier**: Removes HTML comments, collapses multi-spaces between tags, and compresses body whitespace.

### 3.4 Interactive Build Runner (`build.ps1`) & Detailed Guide (`build-guide.md`)
To eliminate developer onboarding friction when cloning or forking the template, the repository includes an interactive PowerShell entry point ([build.ps1](build.ps1)) accompanied by granular documentation ([build-guide.md](build-guide.md)):

```powershell
.\build.ps1
```

The runner enforces a standard 5-phase automated lifecycle:
1. **[1/5] Node.js Runtime Check**: Validates `node -v` availability (Node 18+ requirement).
2. **[2/5] Selective Dependency Check**: Verifies `node_modules/playwright` and triggers automated `npm install` exclusively for required testing devDependencies.
3. **[3/5] Configuration Validation & Guided Setup**: Detects if `build-config.yaml` is missing or contains template placeholders (e.g. `YOUR-URL-DOMAIN.COM HERE`), and offers interactive step-by-step terminal Q&A or manual editing.
4. **[4/5] Interactive Cartridge Resolution**: Prompts for app sources (`[Default: apps (ENTER) or custom path]`), allowing developers to link external cartridge folders seamlessly.
5. **[5/5] Standalone Compilation & Local Serving**: Calls `src/modules/build-bundle.js --apps=<resolvedPath>` and prompts to launch a local HTTP preview server (`http://localhost:8080`).

---

## 4. Five Core Build Metrics & Dual Audit Tables

### 4.1 The Five Core Size Metrics

| Index | Metric Name | Definition & Scope | Status |
| :---: | :--- | :--- | :--- |
| **[1]** | `src` | Raw authoring code in `src/` (`.js`, `.css`, `.html`) | Raw Source |
| **[2]** | `apps` | Cartridge directory in `apps/` (`.html`, `.md`, `.webp`, `.json`) | Isolated Apps |
| **[3]** | `build_without_apps_uncompacted` | Core platform runtime in `public/` excluding `public/apps/` | Core Distribution |
| **[4]** | `build_with_apps_uncompacted` | Total compiled distribution including all cartridges | Full Distribution |
| **[5]** | `build_with_apps_compacted` | Optimized final production payload ready for static airgap | **Target Output** |

### 4.2 Core Audit Table (`build-report-table-core.csv`)
Saved to root and `public/build-report-table-core.csv`:
```csv
Metric,Size_KB,Duration_MS,Description
src,1013.79,0,Total raw source code size (src/)
apps,494.51,0,Total cartridges directory size (apps/)
build_without_apps_uncompacted,1039.33,80,Core platform runtime distribution excluding apps (public/)
build_with_apps_uncompacted,1570.58,80,Total uncompacted distribution size including apps (public/)
build_with_apps_compacted,1451.79,80,Total compacted distribution size including apps (public/)
```

### 4.3 Detailed Payload Audit Table (`build-report-table-detailed.csv`)
Saved to root and `public/build-report-table-detailed.csv`:
Tracks every file compiled to `public/`, its source type, before size, after size, bytes saved, and reduction percentage. Tracks app source markdown files (`index.md`) as `source-only` with `0 KB` compiled footprint.

### 4.4 Dual Report Deliverables (`build-report.md` vs `build-report-flat.md`)
* **`build-report.md`**: Tailored for **Obsidian Markdown** vaults using native transclusion embeds:
  ```markdown
  ### 🎯 5.1 Core Metrics Table
  ![[build-report-table-core.csv]]

  ### 📋 5.2 Detailed Payload Audit Table
  ![[build-report-table-detailed.csv]]
  ```
* **`build-report-flat.md`**: Tailored for standard GitHub / IDE Markdown readers with raw CSV data inside fenced codeblocks:
  ````markdown
  ### 🎯 5.1 Core Metrics Table
  ```csv
  Metric,Size_KB,Duration_MS,Description
  ...
  ```
  ````

---

## 5. Client JS Bundles & Module Architecture

### 5.1 Bundle 1: `public/page-apps.js` (Catalog Hub)
The catalog hub bundle powers `page-apps.html`:
* **Theme & Accent Engine**: Real-time OKLCH palette tinting.
* **Catalog Core**: Renders 3.5" floppy diskette cards, handles dynamic sector filter tabs (`MATH & CANVAS`, `SLIDEV & DOCS`), search input, and persistent card pinning (`arcade_pinned_apps`).
* **Router & Clean Navigation**: Dynamic routing without hash pollution.
* **Markdown Processor**: Authoring note modal renderer.
* **Static Downloader**: Client-side zip package generator for offline cartridge extraction.

### 5.2 Bundle 2: `public/page-playground.js` (Bento Sandbox & Slidev)
The sandbox engine powers `page-playground.html`:
* **Bento Split Controller**: Manages 60% Left / 40% Right draggable split bar.
* **Dual Stage Iframe**: Sandboxed execution of cartridge HTML.
* **Slidev Deck Controller**: Interactive presentation slide renderer with keyboard controls (`Space`, `ArrowRight`, `ArrowLeft`).
* **Code X-Ray**: Syntax-highlighted inspection of cartridge source code.

### 5.3 Bundle 3: `public/winget.js` (Floating Quick Nav Pod)
A lightweight emergency modal pod enabling rapid navigation between `/page-apps` and `/page-playground` from anywhere on the screen with touch gesture support.

---

## 6. Bento Split-Screen 60/40 Playground & Slidev Integration

### 6.1 6-Cell Bento Topology
On desktop viewports (`>= 900px`), outer scrolling is disabled (`overflow: hidden`), and the window splits into 6 responsive cells:

```text
+--------------------------------------------------------------------------------------------------------+
|                                  TOP NAVIGATION & BREADCRUMB BAR                                       |
+----------------------------------------------------+---------------------------------------------------+
|  LEFT COLUMN: LIVE STAGE (60% Default)             |  RIGHT COLUMN: SLIDEV DECK (40% Default)          |
|                                                    |                                                   |
|  [L1] Stage Control Header (Zoom, Restart, Reload) |  [R1] Slide Title & Cartridge Metadata            |
|  ------------------------------------------------- |  ------------------------------------------------ |
|  [L2] Live Application Screen (Sandboxed Iframe)   |  [R2] Slidev Markdown Narrative & Interactive Code |
|  ------------------------------------------------- |  ------------------------------------------------ |
|  [L3] Collapsible Guided Steps & Explanations      |  [R3] Unified Control Dock (Prev/Next, TTS Audio) |
+----------------------------------------------------+---------------------------------------------------+
```

### 6.2 Slidev Presentation Engine
Slide decks are authored directly in `apps/<slug>/index.md` separated by `---` slide delimiters. The client-side parser extracts slide titles, bullet points, interactive code blocks, and audio transcripts.

### 6.3 3-Stage Hybrid Text-to-Speech Engine (`tts.js`)
1. **PUBLIC**: Checks for pre-rendered `.mp3` audio files in `public/assets/audio/`.
2. **LOCAL_CACHE**: Reads generated speech synthesis blobs from client `localStorage`.
3. **CLIENT_COMPILED**: Uses Web Speech API (`SpeechSynthesisUtterance`) with bilingual mathematical text expansion (converting $\pi$, $\theta$, $\sin$, $\cos$, $\tan$ to natural phonetic speech in `id-ID` and `en-US`).

---

## 7. Stylesheet Compilation & Rule Invariants

### 7.1 RULE #1 Verification Protocol
```text
Master Theme  : src/style/theme/vintage-computer/theme.css  (90,924 bytes)
Compiled Theme: public/theme.css                            (90,924 bytes)
Mutation Check: 0 edits / 100% byte fidelity
```
The master theme is never minified or transformed; it is copied verbatim so that upstream Obsidian theme improvements can be pulled cleanly.

### 7.2 CSS Architecture: `style.css`, `terminal.css`, `winget.css`
* `style.css`: Contains the retro skeuomorphic floppy diskette styling, 45-degree corner-cut tab notch, and responsive CSS grid.
* `terminal.css`: Houses `@keyframes terminal-blink` for glowing green/amber CRT cursor effects.
* `winget.css`: Scoped modal styles preventing CSS pollution.

---

## 8. Developer Cockpit & Git Submodule Integration

The toolchain is decoupled as an independent Git submodule at `all-lads-tool/`:

```bash
# Clone repository with submodule:
git clone --recurse-submodules https://github.com/pakcli/fadhlisl-my-id.git

# Or fetch submodule inside existing clone:
git submodule update --init --recursive
```

### Interactive Dispatcher (`main.ps1`)
* Launch via `.\main.ps1` in Windows PowerShell.
* Automatically discovers all 25+ automation scripts across PowerShell, JavaScript, Python, and Batch.
* Quick re-run on `ENTER`.
* Zero Git pollution: session state is kept in `main.env`.

---

## 9. Upstream Template vs Downstream Production (File Separation Matrix)

To enable the repository to serve both as a pristine open-source boilerplate (**`retro-template-catalog-website`**) and as a personal production website (**`fadhlisl-my-id`**), the project defines a strict two-tier file separation matrix.

### 9.1 File Separation Matrix

| File / Directory | Upstream Template Repo (`retro-template-catalog-website`) | Downstream Personal Repo (`fadhlisl-my-id`) | Architectural Invariant & Description |
| :--- | :---: | :---: | :--- |
| **`src/`** | ✅ Tracked | ✅ Tracked | Core engine, modules, styling, and HTML templates. |
| **`build.ps1`** | ✅ Tracked | ✅ Tracked | Interactive build runner with 5-phase lifecycle and guided setup. |
| **`build-guide.md`** | ✅ Tracked | ✅ Tracked | Comprehensive build runner documentation. |
| **`build-config.yamlexample`** | ✅ Tracked | ✅ Tracked | Template blueprint containing example schema. |
| **`build-config.yaml`** | ❌ **Excluded** | ✅ **Required** | Production instance configuration containing domain, personal URLs, and custom preferences. |
| **`build.json`** | ✅ Tracked | ✅ Tracked | Declarative bundling manifesto and build metrics. |
| **`package.json` / `package-lock.json`** | ✅ Tracked | ✅ Tracked | Minimal Playwright testing devDependencies. |
| **`.gitignore`** | ✅ Tracked | ✅ Tracked | Standard exclusions (`public/`, `node_modules/`, `trash-bin/`, `*.env`). |
| **`.github/workflows/deploy.yml`** | ✅ Tracked | ✅ Tracked | Automated GitHub Pages CI/CD deployment workflow. |
| **`apps/`** | 🟡 **Starter Cartridge Only** (`radiansincostan`) | 🟢 **Complete Collection** (All personal cartridges) | Template contains minimal proof-of-concept starter; production hosts full personal app portfolio. |
| **`public/`** | ❌ Excluded (CI Built) | ⚙️ Excluded / Deployed | Output directory generated at build time. |
| **`brief/` & `docs/`** | ✅ Tracked | ✅ Tracked | Technical specifications and architectural rules. |
| **`trash-bin/` & `*.env`** | ❌ Excluded | ❌ Excluded | Ephemeral local work files. |

### 9.2 Git Dual-Push Workflow (Zero-Script Approach)

Maintainers manage both repositories from a single local clone using Git branch targeting:

```bash
# 1. Push clean template to upstream repository:
git push https://github.com/pakcli/retro-template-catalog-website.git template:main

# 2. Push personal instance to production repository:
git push https://github.com/pakcli/fadhlisl-my-id.git main
```

### 9.3 Upstream Synchronization Protocol

When improvements are made to the core engine in `src/` or `build.ps1`, changes are merged downstream without polluting personal cartridge content:

```bash
git checkout main
git merge template -m "chore(sync): pull latest engine improvements from template"
```

### 9.4 Tradeoff Analysis: Why Use 1 Unified Repo Instead of Two?

While a two-repository split (Upstream Template vs Downstream Production) is technically viable, maintaining a **Single Unified Repository (`fadhlisl-my-id`)** is the optimal architectural strategy for this project.

#### 📊 Comparative Matrix: 1 Unified Repo vs 2 Split Repos

| Evaluation Dimension | 1 Unified Repository (`fadhlisl-my-id`) ⭐ *(Recommended)* | 2 Separate Repositories (`template` + `personal`) | Winner & Architectural Rationale |
| :--- | :--- | :--- | :---: |
| **Operational Overhead** | **Zero Friction**: 1 local working directory, 1 git push, 1 commit history. | **High Overhead**: Requires dual-push commands, submodule synchronization, and cross-repo cherry-picking. | 🏆 **1 Repo** |
| **Forkability for Users** | **Instant 1-Click Fork**: Anyone can fork the repo, run `.\build.ps1`, and reconfigure to their own identity via interactive Guided Setup. | **Multi-Step Setup**: Users must fork the template, then create their own downstream repo, and manually link upstream remotes. | 🏆 **1 Repo** |
| **CI/CD & Deployment** | **Seamless**: Single `.github/workflows/deploy.yml` deploys straight to GitHub Pages on every push to `main`. | **Fragmented**: Requires configuring 2 independent GitHub Actions pipelines and secrets across 2 repositories. | 🏆 **1 Repo** |
| **Atomic Commits** | **Full Atomicity**: An engine enhancement in `src/` and the cartridge that demonstrates it in `apps/` are committed together in one commit. | **Desynchronized**: Engine code and cartridge code live in different repos; git history becomes fragmented and harder to trace. | 🏆 **1 Repo** |
| **Code Drift Prevention** | **Zero Drift**: The template engine is always tested against real, live cartridges. | **High Drift Risk**: Upstream template easily falls out of sync with downstream customizations, resulting in merge conflicts. | 🏆 **1 Repo** |
| **Out-of-the-Box Experience** | **Batteries-Included**: Clone and run; contains real working cartridges (`radiansincostan`) as immediate visual proof. | **Hollow Boilerplate**: Template starts empty or requires manual population before previewing. | 🏆 **1 Repo** |

#### 🎯 Key Architectural Justification for 1 Repo:
1. **Interactive Self-Reconfiguration**: Because [build.ps1](build.ps1) now includes an interactive **Guided Setup**, any developer who forks `fadhlisl-my-id` is automatically prompted to input their own website title, author name, domain, and custom apps. The repo already acts as its own template without needing a separate empty repository shell!
2. **Reduced Cognitive Load**: Eliminates the mental tax of remembering which remote to push to, preventing accidental leak of private configs to public template branches.

### 9.5 Branch Conflict Matrix: `template` vs `main (unified)` vs `upstream lain`

When developers maintain multiple divergent branches or cross-repo remotes, Git conflicts inevitably occur during merges. The matrix below documents every conflict vector, its root cause, and how the **Unified 1-Repo Architecture** prevents it.

#### ⚔️ Branch Conflict Scenario Matrix

| Area yang Diedit | Branch: `template`<br>*(Boilerplate Induk)* | Branch: `main (unified)`<br>*(Personal `fadhlisl-my-id`)* | Branch: `upstream lain`<br>*(Fork / Downstream Lain)* | Resiko Konflik | Analisis Konflik & Solusi Arsitektur |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **1. Cartridge Apps (`apps/`)** | **TIDAK DI-PUSH**<br>*(Di-ignore via `.gitignore`)* | **TIDAK DI-PUSH**<br>*(Lokal di laptopmu)* | **TIDAK DI-PUSH**<br>*(Lokal di laptop mereka)* | 🟢 **0% (NO CONFLICT)** | **Status**: Karena `apps/` tidak di-push ke Git, tidak akan pernah ada bentrok file cartridge!<br>**Mekanisme**: Setiap orang mengarahkan `build.ps1` ke folder cartridge lokal masing-masing via prompt: *"Where are your cartridge apps located?"*. |
| **2. Konfigurasi (`build-config.yaml`)** | Placeholder template acuan (`build-config.yamlexample`). | Konfigurasi aktifmu (`base: fadhlisl.github.io`). | Konfigurasi aktif mereka (`base: their-domain.com`). | 🚨 **KRITIKAL (100% Conflict)** | **Penyebab**: Jika `build-config.yaml` ikut di-push ke semua branch, setiap merge upstream akan bentrok baris demi baris.<br>**Solusi**: Template hanya melacak `.yamlexample`. Branch personal men-generate `build-config.yaml` lokal via `build.ps1` Guided Setup. |
| **3. Core Engine (`src/`)** | Update optimasi regex, bundler, atau CSS tokens. | Custom patch / tweak routing lokal. | Modifikasi layout bento / speech player. | 🟡 **SEDANG (Logic Conflict)** | **Penyebab**: Tiga branch mengedit file JS yang sama di `src/modules/` pada baris fungsi yang sama.<br>**Solusi**: Engine `src/` harus diperlakukan sebagai Upstream Source of Truth; downstream dilarang memodifikasi engine inti secara liar tanpa PR. |
| **4. Header Branding (`README.md`)** | Judul umum template ("Retro Template Catalog Website"). | Judul personalmu ("Vintage Computing Arcade"). | Judul kustom mereka ("My Retro Arcade"). | 🚨 **TINGGI (Header Conflict)** | **Penyebab**: Baris 1-15 `README.md` selalu diubah oleh masing-masing pemilik repo.<br>**Solusi**: Template memisahkan dokumentasi mesin ke `build-guide.md`, sehingga `README.md` induk cukup berisi instruksi ringkas. |
| **5. Dependencies (`package-lock.json`)** | Hanya `playwright: ^1.64.1`. | Menambah testing runner personal. | Menggunakan versi Node/NPM berbeda (format lockfile mismatch). | 🟡 **SEDANG (Binary Hash Mismatch)** | **Penyebab**: Checksum integrity hash pada `package-lock.json` berubah setiap kali `npm install` dijalankan di versi npm berbeda.<br>**Solusi**: Lock dependency seminimal mungkin (hanya Playwright devDependency). |

---

#### 🛡️ Strategi Resolusi Konflik (Jika Tetap Pakai Multi-Branch / Multi-Remote):

Jika terjadi konflik saat menarik update engine dari upstream, gunakan strategi **Merge Strategy `-X ours`** untuk mengunci file personal:

```bash
# 1. Tarik update engine dari template tapi pertahankan file personal:
git checkout main
git merge upstream/main -X ours --no-commit

# 2. Pastikan file identitas personal tidak tertimpa:
git checkout HEAD -- build-config.yaml README.md

# 3. Selesaikan merge:
git commit -m "chore(sync): merged upstream engine updates while preserving personal config"
```

> 💡 **Kesimpulan Arsitektur**:  
> Dengan aturan **`apps/` TIDAK DI-PUSH secara default** dan konfigurasi di-handle oleh **Guided Setup [build.ps1](build.ps1)**, alur **1 Unified Repository (`fadhlisl-my-id`)** adalah yang paling aman dan bebas dari drama merge conflict!

> 💡 **Kesimpulan Arsitektur**:  
> Dengan mengadopsi **1 Unified Repository (`fadhlisl-my-id`)** yang dilengkapi script [build.ps1](build.ps1) berfitur **Guided Setup**, seluruh skenario konflik di atas **hilang 100%**, karena setiap pengguna baru yang mem-fork repositori mendapatkan lingkungan bersih mandiri (*isolated sandbox*).

---

> **Architectural Sign-off**:  
> Certified compliant with Rule #000 (Decoupled Core), Rule #001 (Zero Hardcoded Variables), Rule #002 (Zero Horizontal Scroll), Rule #003 (Theme Immutability), Rule #004 (Strict Kebab-Case Naming), and Rule #005 (Root README.md).
