# Retro IT Knowledge Arcade

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build: Standalone CSR](https://img.shields.io/badge/Build-Zero%20Backend%20CSR-green.svg)](#)
[![Zero Backend](https://img.shields.io/badge/Offline-100%25%20Airgap-blue.svg)](#)
[![Milestone: v01-02-03](https://img.shields.io/badge/Milestone-v01--02--03-blueviolet.svg)](#)

> **Tactile retro-computing catalog arcade and dual-panel Bento playground engineered with 100% offline airgap capability, clean directory routing, decoupled data architecture, interactive CLI breadcrumb search, and zero hard dependencies.**

---

## 📑 Core Pillars (4 Subsystems)

1. **`/apps` (Web Applications & Interactive Decks)**: Single-file cartridge web engines, offline tools, and interactive slide decks.
2. **`/skills` (Modular Agent Directives)**: Standardized prompt directives, AI agent behaviors, and portable development standards.
3. **`/combos` (Workflow Pipelines)**: Multi-stage meta-skill workflow orchestration pipelines, release checklists, and review gates.
4. **`/scripts` (Context Ops & CLI Automations)**: Portable cross-platform PowerShell, Python, and Bash automation tools with standalone export.

---

## 📐 3 Display Modes per Subsystem

- **Mode 1: `Card Detailed`**: Strict **3:4** aspect ratio cards with **16:9** media preview (~42% vertical height), Title first then Purpose, complete telemetry row (Size, LOC, Tokens, Tags), primary action + secondary split action.
- **Mode 2: `Card Simple`**: Strict **3:4** aspect ratio cards with **16:9** compact preview, telemetry in Row 1 alongside PIN button, wide primary button + square jump button `[ ↗ ]`.
- **Mode 3: `Table List`**: Monospace tabular ledger (Desktop $\le 72$ cols, Mobile $\le 60$ cols) with front-loaded pin bookmark and tactile actions:
  ```text
  [PIN] | [TITLE]              | [CATEGORY]    | [SIZE] | [FIRST 3 TAGS]               | [DOWNLOAD]   | [STANDALONE]
  ------------------------------------------------------------------------------------------------------------------
  ★ PIN | Unit Circle Resolver | MATH & CANVAS | 6.8 KB | SVG Arc, Math, Zero-Backend  | ⬇ Download   | ↗ Standalone
  ```

---

## 🧭 Interactive CLI Breadcrumb & Omni-Suggestions

The navigation bar functions as an interactive, live CLI prompt:
- **Direct Live Search**: Type directly into the breadcrumb prompt (`home / apps > [search query]`).
- **Dual Delimiter Support**: Accepts `/` and `>` interchangeably during live typing (`apps/` or `apps >`).
- **Instant Suggestions**: Typing `/` alone displays all 5 subsystem routes; typing `apps/`, `skills/`, `combos/`, or `scripts/` instantly lists all cartridges in that subsystem.
- **Smart Backspace Navigation**: Pressing Backspace at the start of the query deletes the `>` delimiter and navigates back into the parent subsystem name (`apps >` $\rightarrow$ `app|`).
- **Auto-Canonicalization**: On Enter, click, or page reload, input normalizes back to canonical prompt syntax (`home / <subsystem> > <query>`).
- **Clean A-Z Monospace**: Replaced icon glyphs with crisp, accessible monospace text (`home` instead of home emoji).

---

## 🎮 Home Hub Menu & Tactile Button Rows

The Master Hub (`public/index.html`) provides a high-density launcher for all 4 subsystems:
- **Dual-Action Split Row**: Each subsystem card features an asymmetric action row:
  - **70% Primary Action**: `Open Stage` with vintage 3D beveled button styling (`box-shadow: inset 1px 1px 0px ...`).
  - **30% Secondary Action**: `Share Link` with copy-to-clipboard toast feedback.
- **Desktop 100dvh Fit**: Zero vertical page scroll on standard desktop viewports.

---

## 🎨 Theme & Accent Customization

- **Light Mode & Dark Mode**: Persistent toggle (`☀️ Light Mode` / `🌙 Dark Mode`) with clean URL parameter preservation.
- **Palette Picker**: Dynamic CSS variable accent switcher (`--interactive-accent`).
- **Theme Immutability (Rule #1)**: `src/style/themes/vintage-computer/theme.css` remains preserved with static SHA-256 integrity (`808E552D...`).

---

## 🌐 4-Tier Clean URL Routing Standard (Without `?` prefix)

- `domain.com/<context>/` $\rightarrow$ Catalog overview in active display mode.
- `domain.com/<context>/<title>` $\rightarrow$ Detailed specification drawer & documentation.
- `domain.com/<context>/<title>=?playground` $\rightarrow$ Dual-Panel Playground (Split stage: Live sandboxed engine on left, inspector tabs on right).
- `domain.com/<context>/<title>=?play` $\rightarrow$ 100% Fullscreen Zen Mode (distraction-free focus with smooth `history.replaceState` live toggle `play <=> playground`).
- `domain.com/<context>/<title>=?standalone` $\rightarrow$ Direct execution / download of standalone cartridge artifact.

---

## 🏗️ Directory Topology

```text
web-app_catalog-style-retro_GITHUB/
├── brief/                                 # Architectural & UI/UX Decision Records
│   ├── v01-02-00_uiux-catalog-arcade-4-subsystems-3-display-modes.md
│   ├── v01-02-01_architecture-branch-folder-structure-and-external-push-tooling.md
│   ├── v01-02-02_home-menu.md
│   └── v01-02-03_navigation-search-interaction-cli-suggestions.md
│
├── data/                                  # Decoupled Raw Content Inputs (SSOT)
│   ├── assets/                            # WebP thumbnails, preview images, icons
│   ├── apps/                              # Per-App Bundles (index.html, index.md, index.json)
│   ├── skills/                            # Directives catalog and markdown specs
│   ├── combos/                            # Pipeline recipes and workflow specs
│   └── scripts/                           # Script automations and CLI manifests
│
├── src/                                   # Frontend Engine Source (Zero Data)
│   ├── uiComponent/                       # Atomic cardDetailedItem, cardSimpleItem, tableListRow
│   ├── uiLayout/                          # Modular view shells: menu, hero, navigation-panel, apps
│   ├── modules/                           # Pure business logic: build-bundle, router, themeEngine
│   └── style/themes/                      # Vintage computer CSS themes (Rule #1 Safe)
│
├── public/                                # Compiled Static Distribution Output (Clean Directory URLs)
│   ├── index.html                         # Master Hub Terminal
│   ├── apps/index.html                    # Apps Arcade Catalog
│   ├── skills/index.html                  # Skills Directory Ledger
│   ├── combos/index.html                  # Combos Workflow Catalog
│   ├── scripts/index.html                 # Scripts Context Ops Deck
│   ├── main.js                            # Unified client bundle with Omni-Catalog
│   ├── theme.css                          # Active vintage theme
│   ├── style.css                          # Bundled UI layout stylesheet
│   └── data/                              # Compiled standalone downloadable cartridges
│
├── build-config.yaml.example              # Template config (sources, deployment, compiler)
├── build-config.yaml                      # Active configuration
├── build.ps1                              # Master PowerShell build runner
├── push-external.ps1                      # Automated clean push to gh-pages with sanitizer scan
└── package.json                           # Project manifest (v1.2.3 / v01-02-03)
```

---

## Quickstart & Build

Compile the static distribution:
```bash
node src/modules/build-bundle.js
# or via npm:
npm run build
```

Serve locally:
```bash
npm run serve
# or
powershell -File ./build.ps1 -Serve -Port 8080
```

Deploy to GitHub Pages:
```powershell
powershell -File ./push-external.ps1 -Remote origin -Branch gh-pages
```

---

## Architectural Invariants

1. **Theme Immutability (Rule #1)**: Themes in `src/style/themes/` are preserved without ad-hoc overrides (SHA-256 verified).
2. **Zero Horizontal Scroll (Rule #2)**: Mobile view is guaranteed zero horizontal scroll ($\le 60$ cols monospace budget).
3. **Zero Hardcoded Variables (Rule #3)**: All paths are dynamically discovered and validated via `Test-PathWithinRoot` jail guards.
4. **Privacy Default Masking Protocol (Rule #4)**: Sensitive data is 2-letter masked on default state (`my******@domain.com`).
5. **Zero-Emoji Data Standard**: All data catalogs, titles, and suggestion lists are clean plain-text; emojis are strictly reserved for functional UI/button icons.
