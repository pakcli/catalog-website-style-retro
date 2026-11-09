---
title: UI/UX Master Specification — Retro Catalog Arcade (4 Subsystems x 3 Display Modes)
version: v01-04-02
date: 2026-11-09
status: APPROVED_FINAL_SPEC
standards:
  - "[[uiux-wireframe-via-text-ascii-codeblock]]"
  - "[[zero-hardcoded-variables]]"
  - "[[zero-hardcoded-sensitive-variables]]"
  - "Rule #1: Theme Immutability (theme.css retro CRT olive/amber #B0A84A)"
  - "Rule #2: Mobile Zero Horizontal Scroll (<=60 cols)"
  - "Rule #4: Privacy Default Masking Protocol (2-Letter Exposure Rule)"
---

# 📐 UI/UX Master Specification: Retro Catalog Arcade

## 1. Executive Summary & Core Invariants

Dokumen ini adalah spesifikasi UI/UX baku dan final untuk arsitektur website katalog IT mandiri:
1. **5 Halaman Mandiri**:
   - `mainmenu` (Master Terminal Hub)
   - `/apps` (Web Application & Decks Arcade)
   - `/skills` (90+ Modular Agent Directives)
   - `/combos` (Meta-Skill Workflow Pipelines)
   - `/scripts` (Context Ops & CLI Automations)
2. **3 Display Modes per Subsystem**:
   - **Mode 1: `Card Detailed`** (Rasio 1:1 bujur sangkar, slot 16:9, metadata lengkap, primary action, secondary dual action).
   - **Mode 2: `Card Simple`** (Rasio 1:1 bujur sangkar, Category badge di pojok kiri atas, PIN button di pojok kanan atas, preview media, judul, dan action bar).
   - **Mode 3: `Table List`** (Ledger tabular ramping dengan urutan kolom baku: `pin, title, category, size, first 3 tags, btn download, btn standalone`).
3. **Golden Invariants Baku**:
   - **Card Container**: Wajib rasio **1:1** bujur sangkar (`aspect-ratio: 1 / 1;`) untuk Simple Card, Detail Card, dan Home Hub.
   - **Grid Alignment**: Seluruh kartu wajib rata kiri (`margin: 0; justify-content: start;`) selaras dengan batas kiri `.arcade-shell` dan `.filter-bar` (0px offset).
   - **Media / Preview Slot**: Wajib rasio **16:9** landscape (`aspect-ratio: 16 / 9;`).
   - **Hirarki Konten Kartu**: **Title DULUAN, baru Purpose** (`tittle baru porpuse`).
   - **Tanpa Label `| none`**: Elemen yang tidak ada otomatis di-omit (tidak meninggalkan space kosong).
   - **Mobile Budget Width**: Maksimal **60 karakter** (bebas horizontal scrolling di layar HP 320px–480px).
   - **Desktop Budget Width**: Maksimal **72 karakter**.
   - **Interactive CLI Breadcrumb & Omni-Suggestions**:
     - User dapat mengetik manual di bar navigasi prompt.
     - User dapat melakukan **Backspace melintasi `>`** mundur ke nama subsistem: `apps > title` -> `app|`.
     - Delimiter fleksibel: mendukung `/` dan `>` secara interchangeable saat mengetik (`apps / title` atau `apps > title`).
     - Pada `[Enter]`, reload, atau search apply, prompt kanonikal kembali ke format baku `>`.
     - Popover `#suggestionBox` menyediakan autokomplet navigasi `[NAV]` dan pencarian lintas-subsistem (`atitlefromaskillorapp`).
   - **Tags Column (Decoupled Policy)**: Tidak ada trigger yang di-hardcode di `all-lads-tool`. Seluruh kapabilitas diindeks via **`tags`** (`#security`, `#frontend`, `#git`, dll). Tiap target project secara berdaulat menentukan apakah tag/skill tersebut berjalan otomatis (Always-On) atau On-Demand di level konfigurasi project itu sendiri.
   - **Lazy-Dev Principle**: Baked static CLI output dengan kursor `█`, tombol `[ 📋 COPY ]` 1-tap, zero raw typing di mobile.

---

## 2. Navigasi Global, CLI Search Bar & User Preferences

### 2.1 Persistent CLI Breadcrumb & Interactive Prompt (`navbar-search`)

- **Kanonikal Desktop View (72 Cols)**:
```text
┌──────────────────────────────────────────────────────────────────────┐
│ home / apps > [ Type title or command...           ] [⛶] [🔍] [☀️/🌙]│
└──────────────────────────────────────────────────────────────────────┘
```
- **Live Backspace & Delimiter State**:
  - Saat input kosong dan menekan `Backspace`, delimiter `>` terhapus dan mundur ke segmen subsistem: `apps >` -> `app|`.
  - Mendukung delimiter ganda `/` dan `>`: `apps / resolver` atau `apps > resolver`.
  - Pada commit (`[Enter]` / reload / apply), format kanonikal kembali ke `home / apps > [query]`.

### 2.2 Omni-Suggestion Popover (`#suggestionBox`)
Muncul dinamis tepat di bawah CLI prompt bar saat mengetik token navigasi atau judul:
```text
┌──────────────────────────────────────────────────────────────────────┐
│ [NAV]  💾 /apps/              -> Jump to /apps/ (Cartridges)         │
│ [SKIL] ⚡ Prompt Directives   -> AGENTIC PROMPTS • 4.2 KB            │
│ [COMB] 🔄 Bundler Pipeline    -> CI/CD PIPELINES • 5.5 KB            │
│ [APP]  📐 Unit Circle Resolver -> MATH & CANVAS • 6.8 KB             │
├──────────────────────────────────────────────────────────────────────┤
│ [↑↓] Navigate   [ENTER] Select / Open   [TAB] Complete   [ESC] Close │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.3 User Preferences & Demo Environment (LocalStorage + 2-Letter Masking)
Mengadopsi konfigurasi dari `_run.env.example` dengan dukungan OS Switcher (`Win 11 | Win 10 | Win XP | macOS | Linux`):
```text
┌──────────────────────────────────────────────────────────────────────┐
│ USER PREFERENCES & DEMO ENVIRONMENT (LOCALSTORAGE)           [ESC: X]│
├──────────────────────────────────────────────────────────────────────┤
│ Default State: Sensitive data is 2-letter masked. Click [👁] to reveal│
├──────────────────────────────────────────────────────────────────────┤
│ TARGET OS : [(*) Win 11]  [( ) Win 10]  [( ) Win XP]  [( ) Mac/Linux]│
│ USERNAME  : [ my****                                   ] [👁 Reveal]│
│ EMAIL     : [ my******@users.noreply.github.com        ] [👁 Reveal]│
│ ACTIVE    : [ all-lads-tool                                        ] │
├──────────────────────────────────────────────────────────────────────┤
│ [ Reset to Default _run.env.example ]        [ Save to LocalStorage ]│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Specification: 4 Subsystems $\times$ 3 Display Modes

---

### SUBSYSTEM 1: `/apps` (Web Applications & Interactive Decks)

#### 1.1 `/apps` — Mode 1: Card Detailed (3:4 Ratio, Desktop 72 Cols)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ CATEGORY: SLIDEV & PRESENTATIONS                            [*] PIN │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 WIDESCREEN PREVIEW ────────────────────────────────────────┐ │
│ │                                                                  │ │
│ │              [ WEBP AUTOMATED PLAYWRIGHT SCREENSHOT ]            │ │
│ │                                                                  │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] Modular Slidev Presentation Deck                                 │
│ Purpose: Client-rendered Markdown presentation engine, zero-backend. │
├──────────────────────────────────────────────────────────────────────┤
│ 16.4 KB │ 320 LOC │ ~2.1k tok                │ #Slidev  #MD  #Cache  │
├──────────────────────────────────────────────────────────────────────┤
│ [ =================== Open in Playground ========================= ] │
├──────────────────────────────────────┬───────────────────────────────┤
│ [ Download .html ]                   │ [ Standalone Slidev (->) ]    │
└──────────────────────────────────────┴───────────────────────────────┘
```

#### 1.2 `/apps` — Mode 2: Card Simple (3:4 Ratio, Desktop 72 Cols)
*(Telemetry di Row 1 bersama PIN; Tombol bawah lebar `[ ⬇ Download ]` berdampingan dengan `[ ↗ ]`)*
```text
┌──────────────────────────────────────────────────────────────────────┐
│ 16.4 KB │ 320 LOC │ ~2.1k tok                              [*] PIN   │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 COMPACT PREVIEW ───────────────────────────────────────────┐ │
│ │ [ MINI WEBP APP SCREENSHOT ]                                     │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] Modular Slidev Presentation Deck                                 │
│ Purpose: Offline presentation engine with client-side markdown.      │
├──────────────────────────────────────────────────────────────────────┤
│ [ =================== Open in Playground ========================= ] │
├───────────────────────────────────────────────────────┬──────────────┤
│ [ ⬇ Download ]                                        │ [ ↗ ]        │
└───────────────────────────────────────────────────────┴──────────────┘
```

#### 1.3 `/apps` — Mode 3: Table List (Mobile 60 Cols // Desktop 72 Cols)

- **Mobile View (60 Cols)**:
```text
┌──────────────────────────┬──────────┬────────────────────────┐
│ >_ NAME                  │ CATEGORY │ ACTIONS                │
├──────────────────────────┼──────────┼────────────────────────┤
│ modular-slidev-deck.html │ slidev   │ [Play] [DL]            │
│ markdown-mindmap.html    │ visual   │ [Play] [DL]            │
│ retro-diff-checker.html  │ text/git │ [Play] [DL]            │
└──────────────────────────┴──────────┴────────────────────────┘
```

- **Desktop View (72 Cols)**:
```text
┌──────────────────────────────────────┬─────────────┬─────────────────┐
│ >_ NAME                              │ CATEGORY    │ ACTIONS         │
├──────────────────────────────────────┼─────────────┼─────────────────┤
│ modular-slidev-deck.html             │ slidev/deck │ [Play] [DL]     │
│ markdown-mindmap.html                │ visual/tree │ [Play] [DL]     │
│ retro-diff-checker.html              │ text/git    │ [Play] [DL]     │
└──────────────────────────────────────┴─────────────┴─────────────────┘
```

---

### SUBSYSTEM 2: `/skills` (90+ Modular Agent Directives)

#### 2.1 `/skills` — Mode 1: Card Detailed (3:4 Ratio, Desktop 72 Cols)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ CATEGORY: FRONTEND & WIREFRAME STANDARDS                    [*] PIN │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 CODE SPEC PREVIEW ─────────────────────────────────────────┐ │
│ │ Desktop <= 80 cols | Mobile <= 60 cols | Monospace Rectangles    │ │
│ │ Zero wide emojis in bordered lines | Strict character alignment  │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] uiux-wireframe-via-text-ascii-codeblock                          │
│ Purpose: Monospace text ASCII codeblock grammar for UI/UX drafting.  │
├──────────────────────────────────────────────────────────────────────┤
│ 6.1 KB  │ 167 LOC │ ~850 tok                 │ #UIUX  #ASCII  #Docs  │
├──────────────────────────────────────┬───────────────────────────────┤
│ [ Copy Prompt Directive ]            │ [ Inspect Full Spec (->) ]    │
└──────────────────────────────────────┴───────────────────────────────┘
```

#### 2.2 `/skills` — Mode 2: Card Simple (3:4 Ratio, Desktop 72 Cols)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ 6.1 KB │ 167 LOC │ ~850 tok                                [*] PIN   │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 COMPACT SPEC PREVIEW ──────────────────────────────────────┐ │
│ │ Box grammar, character-width budgets, atomic UI specifications   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] uiux-wireframe-via-text-ascii-codeblock                          │
│ Purpose: Standardized monospace ASCII grammar for UI wireframing.    │
├───────────────────────────────────────────────────────┬──────────────┤
│ [ Copy Prompt Directive ]                             │ [ ↗ ]        │
└───────────────────────────────────────────────────────┴──────────────┘
```

#### 2.3 `/skills` — Mode 3: Table List (Mobile 60 Cols // Desktop 72 Cols)

- **Mobile View (60 Cols — Primary Tag)**:
```text
┌───────────────────────┬───────────┬─────────────────────┐
│ >_ NAME               │ TAG       │ ACTIONS             │
├───────────────────────┼───────────┼─────────────────────┤
│ uiux-wireframe-text   │ #frontend │ [Copy] [DL]         │
│ zero-hardcoded-vars   │ #security │ [Copy] [DL]         │
│ theme-immutability    │ #styling  │ [Copy] [DL]         │
│ decoupled-skill-meta  │ #meta     │ [Copy] [DL]         │
└───────────────────────┴───────────┴─────────────────────┘
```

- **Desktop View (72 Cols — Multi-Tags + Category)**:
```text
┌─────────────────────────┬──────────────────┬──────────┬──────────────┐
│ >_ NAME                 │ TAGS             │ CATEGORY │ ACTIONS      │
├─────────────────────────┼──────────────────┼──────────┼──────────────┤
│ uiux-wireframe-via-text │ #frontend, #uiux │ ops      │ [Copy] [DL]  │
│ zero-hardcoded-variable │ #security, #rule │ rule     │ [Copy] [DL]  │
│ theme-css-immutability  │ #css, #styling   │ rule     │ [Copy] [DL]  │
│ decoupled-skill-meta    │ #meta, #arch     │ ops      │ [Copy] [DL]  │
└─────────────────────────┴──────────────────┴──────────┴──────────────┘
```

---

### SUBSYSTEM 3: `/combos` (Meta-Skill Workflow Pipelines)

#### 3.1 `/combos` — Mode 1: Card Detailed (3:4 Ratio, Desktop 72 Cols)
*(Slot media 16:9 menampung max 5 rows in view yang scrollable vertikal; Tombol graph di kanan bawah)*
```text
┌──────────────────────────────────────────────────────────────────────┐
│ CATEGORY: RELEASE ORCHESTRATION                             [*] PIN │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 PIPELINE FLOW (MAX 5 ROWS VISIBLE // SCROLLABLE) ────────[▲]─┐ │
│ │ (1) repo-structure-standard                       [VALIDATE]   │█│ │
│ │ (2) documentation-markdown-architecture           [DOCGEN]     │█│ │
│ │ (3) zero-hardcoded-variables-without-agent        [SANITIZE]   │░│ │
│ │ (4) sensitive-data-sanitizer                      [SECURITY]   │░│ │
│ │ (5) wdyt-and-how-to-perfected-it                  [REVIEW]     │▼│ │
│ └────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] software-development-opensource.md                               │
│ Purpose: Complete end-to-end sanitized open source release pipeline. │
├──────────────────────────────────────────────────────────────────────┤
│ 12.3 KB │ 240 LOC │ ~1.8k tok                │ #OpenSrc  #Flow  #Sec │
├──────────────────────────────────────┬───────────────────────────────┤
│ [ Copy Master Workflow Prompt ]      │ [ View Workflow Graph (->) ]  │
└──────────────────────────────────────┴───────────────────────────────┘
```

#### 3.2 `/combos` — Mode 2: Card Simple (3:4 Ratio, Desktop 72 Cols)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ 12.3 KB │ 240 LOC │ ~1.8k tok                              [*] PIN   │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 COMPACT PIPELINE ──────────────────────────────────────────┐ │
│ │ 1:struct > 2:doc > 3:sec > 4:sanitize > 5:wdyt                     │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] software-development-opensource.md                               │
│ Purpose: Multi-stage pipeline for sanitized open-source publishing.  │
├───────────────────────────────────────────────────────┬──────────────┤
│ [ Copy Master Recipe ]                                │ [ ↗ ]        │
└───────────────────────────────────────────────────────┴──────────────┘
```

#### 3.3 `/combos` — Mode 3: Table List (Mobile 60 Cols // Desktop 72 Cols)

- **Mobile View (60 Cols)**:
```text
┌──────────────────────────┬──────────┬────────────────────────┐
│ >_ NAME                  │ CATEGORY │ ACTIONS                │
├──────────────────────────┼──────────┼────────────────────────┤
│ software-development-os  │ release  │ [Copy] [DL]            │
│ wdyt-and-how-to-perfect  │ review   │ [Copy] [DL]            │
│ explain-install-engine   │ setup    │ [Copy] [DL]            │
└──────────────────────────┴──────────┴────────────────────────┘
```

- **Desktop View (72 Cols)**:
```text
┌──────────────────────────────────────┬─────────────┬─────────────────┐
│ >_ NAME                              │ CATEGORY    │ ACTIONS         │
├──────────────────────────────────────┼─────────────┼─────────────────┤
│ software-development-opensource.md   │ release     │ [Copy] [DL]     │
│ wdyt-and-how-to-perfected-it.md      │ review      │ [Copy] [DL]     │
│ explain-install-engine-data.md       │ setup       │ [Copy] [DL]     │
└──────────────────────────────────────┴─────────────┴─────────────────┘
```

---

### SUBSYSTEM 4: `/scripts` & `/docs` (Context Ops & CLI Automations)

#### 4.1 `/scripts` — Mode 1: Card Detailed (3:4 Ratio, Desktop 72 Cols)
*(Slot media 16:9 menampilkan baked terminal replay dengan kursor `█` dan tombol copy instan)*
```text
┌──────────────────────────────────────────────────────────────────────┐
│ CATEGORY: GIT REPOSITORY OPS                                [*] PIN │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 BAKED TERMINAL REPLAY ───────────────────────── [ 📋 COPY ]─┐ │
│ │ PS C:\Repos> ./cd-repo.ps1 -folderName "rust"█                     │ │
│ │ 📁 C:\Repos\rust entered, branch at: [main] ... origin/main        │ │
│ │ [OK] Working directory successfully updated.                       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] cd-repo.ps1                                                      │
│ Purpose: Changes working directory directly to Git repository root.  │
├──────────────────────────────────────────────────────────────────────┤
│ 8.2 KB  │ 186 LOC │ ~1.1k tok                │ #Git  #Repo  #Nav     │
├──────────────────────────────────────────────────────────────────────┤
│ [ ================= Launch Dry-Test Runner ======================= ] │
├──────────────────────────────────────┬───────────────────────────────┤
│ [ Copy 1-Liner Cmd ]                 │ [ Download _standalone.ps1 ]  │
└──────────────────────────────────────┴───────────────────────────────┘
```

#### 4.2 `/scripts` — Mode 2: Card Simple (3:4 Ratio, Desktop 72 Cols)
```text
┌──────────────────────────────────────────────────────────────────────┐
│ 8.2 KB │ 186 LOC │ ~1.1k tok                               [*] PIN   │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ 16:9 BAKED TERMINAL SNIPPET ──────────────────────── [ 📋 COPY ]─┐ │
│ │ PS> ./cd-repo.ps1 "rust"█                                          │ │
│ └────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ [#] cd-repo.ps1                                                      │
│ Purpose: Navigates working folder directly to target Git repo root.  │
├──────────────────────────────────────────────────────────────────────┤
│ [ ================= Launch Dry-Test Runner ======================= ] │
├───────────────────────────────────────────────────────┬──────────────┤
│ [ ⚡ Download Standalone ]                             │ [ ↗ ]        │
└───────────────────────────────────────────────────────┴──────────────┘
```

#### 4.3 `/scripts` — Mode 3: Table List (Mobile 60 Cols // Desktop 72 Cols)

- **Mobile View (60 Cols)**:
```text
┌──────────────────────────┬──────────┬────────────────────────┐
│ >_ NAME                  │ CATEGORY │ ACTIONS                │
├──────────────────────────┼──────────┼────────────────────────┤
│ cd-repo.ps1              │ git/repo │ [Copy] [DL]            │
│ clean-git-branches.ps1   │ git/repo │ [Copy] [DL]            │
│ batch-export-fbx.py      │ blender  │ [Copy] [DL]            │
│ sanitize-tokens.ps1      │ security │ [Copy] [DL]            │
└──────────────────────────┴──────────┴────────────────────────┘
```

- **Desktop View (72 Cols)**:
```text
┌──────────────────────────────────────┬─────────────┬─────────────────┐
│ >_ NAME                              │ CATEGORY    │ ACTIONS         │
├──────────────────────────────────────┼─────────────┼─────────────────┤
│ cd-repo.ps1                          │ git/repo    │ [Copy] [DL]     │
│ clean-git-branches.ps1               │ git/repo    │ [Copy] [DL]     │
│ batch-export-fbx.py                  │ blender     │ [Copy] [DL]     │
│ sanitize-tokens.ps1                  │ security    │ [Copy] [DL]     │
└──────────────────────────────────────┴─────────────┴─────────────────┘
```

---

## 4. Master Design Matrix

| Dimensi / Komponen | Aturan Baku & Nilai Default |
| :--- | :--- |
| **Card Aspect Ratio** | Wajib **3:4** (`aspect-ratio: 3 / 4;` ~300px $\times$ 400px) |
| **Media Aspect Ratio**| Wajib **16:9** widescreen (`aspect-ratio: 16 / 9;` occupying ~42% vertical height) |
| **Card Information Order** | **Title DULUAN, baru Purpose** (`tittle baru porpuse`) |
| **Card Simple Action** | Tombol lebar (`[ Download ]` / `[ Copy ]`) + tombol kotak panah **`[ ↗ ]`** |
| **Table List Interaction** | Klik judul `>_ NAME` langsung membuka halaman detail |
| **Table Category Budget** | Maksimal **8 Karakter** (`frontend`, `security`, `git/repo`, `slidev`, `blender`) |
| **Table Tags Column** | Menggantikan Trigger. Desktop: Multi-tags (`#security, #rule`). Mobile: Primary Tag (`#security`). Kebijakan trigger didelegasikan ke target project. |
| **Mobile Width Budget** | Maksimal **60 Karakter** (Zero horizontal scroll pada 320px–480px) |
| **Desktop Width Budget**| Maksimal **72 Karakter** (Presisi monospace rata kanan) |

---

## 5. Detailed & Playground Shell Specification (`index_detailed.html` & `*_detail.html`)

Semua halaman detail dan playground dibundel menjadi **satu cartridge terpadu (baked into one)**:
- Untuk `apps`: file pre-baked `data/apps/<title>/index_detailed.html`
- Untuk `skills`, `combos`, `scripts`: file pre-baked `data/<context>/<title>_detail.html`

### 5.1 Clean Routing & Display States (`=?` Suffix Standard)

| URL Pattern | Target View | Deskripsi & Interaksi |
| :--- | :--- | :--- |
| `domain.com/<context>/<title>` | **Detailed Drawer** | Tampilan default: drawer spesifikasi teknis, metadata, GUIDE & README |
| `domain.com/<context>/<title>=?playground` | **Dual-Panel Shell** | Panel Kiri: Live Sandboxed Engine, Panel Kanan: Tabbed Spec/Guide |
| `domain.com/<context>/<title>=?play` | **Zen Mode (Play)** | Layar penuh 100% fokus eksekusi runtime, toggle cepat `play <=> playground` |
| `domain.com/<context>/<title>=?standalone` | **Standalone Engine** | Eksekusi langsung cartridge tunggal mandiri (`index.html` / raw script) |

### 5.2 Wireframe: Dual-Panel Playground Shell (`=?playground`)

- **Desktop View (72 Cols — Dual Split Panel)**:
```text
┌──────────────────────────────────────────────────────────────────────┐
│ < BACK TO CATALOG │ [ZEN PLAY] [PREFS] [DOWNLOAD]            [ESC: X]│
├──────────────────────────────────────┬───────────────────────────────┤
│ ┌─ LIVE SANDBOX / RUNNER ──────────┐ │ [SPEC] [GUIDE] [README] [JSON]│
│ │                                  │ ├───────────────────────────────┤
│ │  Interactive Cartridge Engine    │ │ [#] Markdown Mindmap Engine   │
│ │  (Sandboxed Iframe / REPL)       │ │                               │
│ │                                  │ │ Telemetry: 16.4 KB | 320 LOC  │
│ │  Press [F11] or click [ZEN] for  │ │ Tokens: ~2.1k tok | #Visual   │
│ │  Distraction-Free Zen Mode       │ │                               │
│ │                                  │ │ Guide:                        │
│ │                                  │ │ 1. Paste your markdown text.  │
│ │                                  │ │ 2. Press Render or [Ctrl+Ent] │
│ └──────────────────────────────────┘ │ 3. Export SVG or HTML graph.  │
├──────────────────────────────────────┴───────────────────────────────┤
│ CLI: domain.com/apps/markdown-mindmap=?playground         [ COPY URL]│
└──────────────────────────────────────────────────────────────────────┘
```

- **Mobile View (60 Cols — Stacked Tabs with Zen Toggle)**:
```text
┌──────────────────────────────────────────────────────────┐
│ < BACK │ [ZEN PLAY] [DOWNLOAD]                           │
├──────────────────────────────────────────────────────────┤
│ ┌─ LIVE RUNNER (SANDBOXED) ────────────────────────────┐ │
│ │ Interactive Engine Runtime                           │ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ TABS: [(*) SPEC]  [( ) GUIDE]  [( ) README]  [( ) JSON]  │
├──────────────────────────────────────────────────────────┤
│ [#] Markdown Mindmap Engine                              │
│ Telemetry: 16.4 KB | 320 LOC | ~2.1k tok | #Visual       │
│                                                          │
│ Purpose: Client-rendered interactive mindmap generator.  │
├──────────────────────────────────────────────────────────┤
│ [ ================= Launch Zen Mode ================== ] │
└──────────────────────────────────────────────────────────┘
```

### 5.3 Zen Mode Runtime (`=?play`)
- Layar penuh 100vw $\times$ 100vh tanpa margin atau sidebar.
- Dilengkapi floating pill transparan di pojok kanan atas: `[ Playground ] [ Exit ]`.
- Transisi mulus antara `play <=> playground` menggunakan `history.replaceState` tanpa reload halaman.
