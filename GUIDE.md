---
title: Retro IT Knowledge Arcade Operational & Architecture Guide
category: OPERATIONAL_GUIDE
tags: [arcade, retro-ui, guide, cli, navigation, operations, troubleshooting]
---

# Retro IT Knowledge Arcade Operational Guide (`GUIDE.md`)

> Comprehensive manual for operating, compiling, navigating, and troubleshooting the **Retro IT Knowledge Arcade** static distribution.

---

## 📑 Table of Contents

1. [Runtime & Prerequisites](#1-runtime--prerequisites)
2. [Compilation & Build Pipeline](#2-compilation--build-pipeline)
   - [Core Node.js Compiler (`src/modules/build-bundle.js`)](#core-nodejs-compiler-srcmodulesbuild-bundlejs)
   - [Interactive PowerShell Runner (`build.ps1`)](#interactive-powershell-runner-buildps1)
   - [GitHub Pages Deployment (`push-external.ps1`)](#github-pages-deployment-push-externalps1)
3. [User Interface & Interaction Ergonomics](#3-user-interface--interaction-ergonomics)
   - [Display Modes & Table View Ordering](#display-modes--table-view-ordering)
   - [Home Hub 70/30 Split Action Buttons](#home-hub-7030-split-action-buttons)
   - [Interactive Breadcrumb CLI Prompt & Omni-Suggestions](#interactive-breadcrumb-cli-prompt--omni-suggestions)
   - [Theme & Dark/Light Mode Engine](#theme--darklight-mode-engine)
4. [Data & Catalog Specifications](#4-data--catalog-specifications)
   - [Decoupled Architecture (`data/` vs `src/`)](#decoupled-architecture-data-vs-src)
   - [Zero-Emoji Data Standard](#zero-emoji-data-standard)
5. [Troubleshooting Matrix & Resolved Failure Modes](#5-troubleshooting-matrix--resolved-failure-modes)

---

## 1. Runtime & Prerequisites

The arcade is 100% Client-Side Rendered (CSR) and requires zero backend server at runtime. For compilation and authoring:

| Tool / Runtime | Minimum Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | v18.0.0+ | Executes `build-bundle.js` and compiles static bundles |
| **PowerShell** | 5.1+ / 7.2+ LTS | Runs `build.ps1` and `push-external.ps1` automation |
| **Playwright** | ^1.40.0 (optional) | Automated visual regression & headless verification |

---

## 2. Compilation & Build Pipeline

### Core Node.js Compiler (`src/modules/build-bundle.js`)

Direct single-command compilation:
```bash
node src/modules/build-bundle.js
```

What the compiler performs:
1. **Pillar Page Assembly**: Builds `public/apps/index.html`, `public/skills/index.html`, `public/combos/index.html`, `public/scripts/index.html`, and `public/index.html`.
2. **Omni-Catalog Aggregation**: Collects entries from `data/*/_catalog.json`, strips emojis programmatically, and injects `window.__ARCADE_OMNI_CATALOG__` into `public/main.js`.
3. **Asset & Stylesheet Bundling**: Copies `src/style.css` and the immutable `src/style/themes/vintage-computer/theme.css` to `public/`.
4. **Metrics Auditing**: Generates `build-report-table-core.csv`, `build-report-table-detailed.csv`, and `build-report.md`.

### Interactive PowerShell Runner (`build.ps1`)

```powershell
.\build.ps1 [-AppsDir <path>] [-NoPrompt] [-Serve]
```

- `-AppsDir <path>`: Specify cartridge source directory (default: `./data/apps`).
- `-NoPrompt`: Non-interactive mode for CI/CD pipelines.
- `-Serve`: Automatically spawns a local HTTP preview server on port 8080.

### GitHub Pages Deployment (`push-external.ps1`)

Automates sanitized deployment to the `gh-pages` branch:
```powershell
.\push-external.ps1 -Remote origin -Branch gh-pages
```
- Performs a sensitive data pre-scan before pushing.
- Creates an orphan, clean static distribution commit containing only `public/` contents.

---

## 3. User Interface & Interaction Ergonomics

### Display Modes & Table View Ordering

The arcade supports 3 display modes via the toolbar pills:
- `[ ⊞ Simple ]`: Compact 3:4 cards for fast browsing.
- `[ ⊟ Detail ]`: Rich 3:4 cards with preview canvas and full telemetry.
- `[ ≡ Table ]`: High-density monospace tabular ledger.

**Table View Column Layout (Front-Loaded Pin)**:
```text
Column 1: [ ★ PIN ]      - Sticky bookmark toggle
Column 2: [ TITLE ]        - Clean cartridge name
Column 3: [ CATEGORY ]     - Standardized sector badge (e.g. MATH & CANVAS)
Column 4: [ SIZE ]         - Monospace payload size (e.g. 6.8 KB)
Column 5: [ TAGS ]         - First 3 tags (e.g. SVG Arc, Math Engine, Zero-Backend)
Column 6: [ DOWNLOAD ]     - ⬇ Download .html button
Column 7: [ STANDALONE ]   - ↗ Standalone popout button
```

### Home Hub 70/30 Split Action Buttons

In the Master Hub (`index.html`), subsystem launcher cards feature an asymmetric action row:
- **70% Primary Button**: `Open Stage` with vintage 3D bevel styling (`border-radius: 4px; box-shadow: inset 1px 1px 0px ...`).
- **30% Secondary Button**: `Share Link` with copy feedback.
- Designed to fit strictly within a `100dvh` viewport without outer scrolling on desktop.

### Interactive Breadcrumb CLI Prompt & Omni-Suggestions

The navigation bar (`#topSearchInput`) serves as a live terminal:

| User Action | Result |
| :--- | :--- |
| **Typing into Breadcrumb** | Filters active catalog and queries cross-subsystem Omni-Catalog. |
| **Typing `/` or `>`** | Instantly displays all 5 subsystem jump destinations (`NAV` badges). |
| **Typing `apps/`, `skills/`** | Immediately shows all cartridges belonging to that subsystem. |
| **Pressing Backspace from `>`** | Deletes delimiter and steps backward into parent subsystem (`apps >` $\rightarrow$ `app\|`). |
| **Pressing Enter / Reload** | Normalizes input back to canonical `home / <subsystem> > <query>` format. |
| **Keyboard Navigation** | `[↑↓]` Navigate suggestions, `[ENTER]` Execute, `[TAB]` Complete, `[ESC]` Close. |

### Theme & Dark/Light Mode Engine

- Initialized via inline script in `<head>` to prevent Flash of Unstyled Content (FOUC).
- Persisted in `localStorage.getItem('arcade_theme_mode')`.
- Safe URL handling: Parameter preservation uses standard `URLSearchParams` without regex interpolation.

---

## 4. Data & Catalog Specifications

### Decoupled Architecture (`data/` vs `src/`)

- Content sources reside strictly in `data/` (`data/apps/`, `data/skills/`, `data/combos/`, `data/scripts/`).
- Engine templates reside in `src/` (`src/uiComponent/`, `src/uiLayout/`, `src/modules/`).
- No static app content is hardcoded inside UI engine components.

### Zero-Emoji Data Standard

- All titles, category labels, overviews, and markdown headings in data files must be **clean plain text**.
- Emojis in suggestions and data entries are strictly stripped via regex:
  ```javascript
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu
  ```
- Emojis and glyphs are reserved exclusively for interactive UI buttons (`⛶`, `🔍`, `☀️`/`🌙`, `★`/`📌`, `⬇️`, `↗`, `🔗`).

---

## 5. Troubleshooting Matrix & Resolved Failure Modes

| Issue / Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **SyntaxError: Unexpected token 'if' at main.js:980** | Unescaped regex literal within a template literal in theme toggle URL rewriter. | Replaced custom regex replacer with standard `new URL(window.location.href)` and `url.searchParams.set()`. |
| **Dropdown suggestions displaying duplicate emojis** | Emojis were hardcoded in `_catalog.json` titles and rendered raw in `renderSuggestions`. | Removed emojis from all catalog JSON/MD files and added runtime regex sanitizer in `build-bundle.js`. |
| **Edge CDP connection refused on port 9223** | Headless browser port clash or premature connection attempt. | Implemented dynamic retry polling loop over `/json` endpoint before establishing WebSocket. |
| **Theme CSS modification warning** | Rule #1 violation check failed. | Verified SHA-256 hash of `src/style/themes/vintage-computer/theme.css` matches `808E552D...`. |
| **Mobile horizontal scrolling** | Elements exceeding 60 monospace columns or table overflowing viewport. | Applied `overflow-x: auto` on tables and `overflow-x: clip` on `.catalog-shell`. |
