# 🕹️ Vintage Computing Arcade (`fadhlisl-my-id`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build: Standalone Core](https://img.shields.io/badge/Build-Standalone%20Core-green.svg)](build-report.md)
[![Zero Backend](https://img.shields.io/badge/Backend-Zero%20(Pure%20CSR)-blue.svg)](#)

> **A tactile, retro-computing arcade catalog and dual-panel Bento playground engineered with 100% offline airgap capability, client-side rendering (CSR), and zero hard-dependencies.**

---

## 📑 Table of Contents
- [1. Overview & Philosophy](#1-overview--philosophy)
- [2. Architectural Topology](#2-architectural-topology)
- [3. Quickstart & Standalone Build](#3-quickstart--standalone-build)
- [4. Developer Cockpit & Optional Toolchain (`main.ps1`)](#4-developer-cockpit--optional-toolchain-mainps1)
- [5. Standalone App Cartridges](#5-standalone-app-cartridges)
- [6. Architectural Invariants & Compliance Rules](#6-architectural-invariants--compliance-rules)
- [7. License](#7-license)

---

## 1. Overview & Philosophy

**Vintage Computing Arcade** brings the tactile aesthetic of 1980s personal computing (monospaced typography, 3.5" floppy diskette metaphors, CRT scanlines, and hardware keys) into a modern, lightning-fast client-side web application.

### Key Highlights
* **Zero Core Hard-Dependency (Rule #000)**: The core platform (`src/`, `apps/`, `public/`) builds, tests, and serves 100% self-contained without requiring the developer toolchain.
* **Master Theme Byte-Fidelity (Rule #003)**: Master Obsidian Theme (`theme.css`) is preserved with **0 edits / 100% byte fidelity**.
* **Zero Horizontal Scroll (Rule #002)**: Guaranteed zero outer horizontal scroll across mobile portrait and desktop Bento split viewports.
* **100% Airgap Offline Support**: Every app cartridge can run directly from local files (`file:///`) or standalone `.html` shells without network access.

---

## 2. Architectural Topology

```text
fadhlisl-my-id/
├── README.md                           # Master Project Entry Point (Rule #005)
├── build.json                          # Declarative build manifesto & metrics
├── build-report.md                     # Latest build audit report
├── build-report-table.csv              # Granular bundle payload metrics
├── main.ps1                            # Universal interactive developer cockpit
├── main.json                           # Cockpit script manifest & schemas
├── main.env                            # Local living environment overrides (ignored)
│
├── apps/                               # Cartridge source modules & docs
│   ├── _catalog.json                   # Master catalog JSON copy
│   ├── radiansincostan/                # Math & trigonometry unit circle cartridge
│   └── vibe-arcade-deck/               # Modular Slidev presentation deck
│
├── src/                                # Core Client Engine (Zero Toolchain Dependency)
│   ├── modules/
│   │   ├── build-bundle.js             # Standalone production compiler & bundler
│   │   ├── catalog-core.js             # Dynamic CSR floppy catalog engine
│   │   ├── playground.js               # Dual-Panel Bento playground engine
│   │   ├── theme-engine.js             # Dynamic OKLCH accent color resolver
│   │   └── tts.js                      # Retro voice synthesis engine
│   ├── style/                          # Modular stylesheets & retro floppy disk styles
│   ├── page-apps.html                  # Catalog HTML shell source
│   └── page-playground.html            # Bento playground HTML shell source
│
├── public/                             # Compiled Production Distribution (ZERO .md files)
│   ├── apps/                           # Compiled cartridges & _catalog.json
│   ├── page-apps.html                  # Compiled catalog page
│   ├── page-playground.html            # Compiled playground page
│   ├── page-apps.js                    # Bundled catalog runtime
│   ├── page-playground.js              # Bundled playground runtime
│   └── theme.css                       # Untouched master theme
│
└── all-lads-tool/                      # OPTIONAL Developer Cockpit & Toolchain Submodule
    ├── rule/                           # Architectural rules (#000 to #005)
    ├── skill/                          # AI agent skills & operational runbooks
    ├── script/                         # PowerShell, JS, Python automation scripts
    └── docs/                           # Technical documentation per script
```

---

## 3. Quickstart & Standalone Build

Jalankan script interactive build runner:

```powershell
.\build.ps1
```

Script `build.ps1` akan otomatis menjalankan 5 tahapan:
1. **Pengecekan Node.js runtime** (v18+).
2. **Pengecekan & auto-install devDependencies** (hanya `playwright` jika belum ada).
3. **Pengecekan & Guided Setup `build-config.yaml`** (panduan interaktif jika masih template default).
4. **Konfirmasi lokasi folder cartridge** (`apps/` default atau custom path).
5. **Kompilasi standalone & kompaksi** ke folder `public/` (dengan opsi menjalankan preview server lokal di `http://localhost:8080`).

> 📖 **Panduan Lengkap**: Untuk dokumentasi parameter CLI (`-AppsDir`, `-NoPrompt`, `-Serve`), contoh interaktif, dan troubleshooting, baca **[build-guide.md](build-guide.md)**.

Atau jika ingin menjalankan compiler Node.js secara langsung tanpa prompt:
```bash
node src/modules/build-bundle.js
```

---

## 4. Developer Cockpit & Optional Toolchain (`main.ps1`)

When working in Windows PowerShell, launch the unified developer cockpit:

```powershell
.\main.ps1
```

* **Interactive Menu**: Access Git recovery tools, automated compliance auditors, SCSS compilers, and thumbnail generators.
* **Quick Re-run on ENTER**: Pressing `ENTER` automatically repeats the last executed script.
* **Zero Git Pollution**: Session state is persisted in `main.env`, keeping `main.json` and git status clean.

---

## 5. Standalone App Cartridges

| Cartridge | Sector | Description | Entry Point |
| :--- | :--- | :--- | :--- |
| **`radiansincostan`** | Edu | Interactive trigonometric unit circle resolver tracking sine, cosine, and tangent waveforms. | [`apps/radiansincostan/index.html`](apps/radiansincostan/index.html) |
| **`vibe-arcade-deck`** | Tools | Modular Slidev hybrid presentation engine with speaker notes and retro TTS audio. | [`apps/vibe-arcade-deck/index.html`](apps/vibe-arcade-deck/index.html) |

---

## 6. Architectural Invariants & Compliance Rules

Every contribution to this codebase must adhere to the 6 core invariants enforced by [`audit-codebase.js`](all-lads-tool/script/javascript/audit-codebase.js):

* **Rule #000**: [Master Modular Architecture & Zero Core Hard-Dependency](all-lads-tool/rule/000_main-rule.md)
* **Rule #001**: [Zero Hardcoded Variables & Machine Paths](all-lads-tool/rule/001-skills-no-hardcoded-variables.md)
* **Rule #002**: [Mobile Portrait Zero Horizontal Scroll](all-lads-tool/rule/002-mobile-portrait-zero-horizontal-scroll.md)
* **Rule #003**: [Master Theme CSS Immutability (0 Edits / 100% Byte Fidelity)](all-lads-tool/rule/003-immutable-theme-css.md)
* **Rule #004**: [Strict Kebab-Case Naming & 2-Octet Versioning](all-lads-tool/rule/004_naming.md)
* **Rule #005**: [README.md Always on Root of the Project Repository](all-lads-tool/rule/005_readme-on-root.md)

Run the compliance audit anytime:
```bash
node all-lads-tool/script/javascript/audit-codebase.js
```

---

## 7. License

Released under the open source [MIT License](LICENSE).
Copyright (c) 2026 Vintage Computing Arcade Contributors.
