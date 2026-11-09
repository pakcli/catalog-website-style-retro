---
title: Master Architecture — Folder Structure, Config YAML, Branch Topology & Routing
version: v01-04-03
date: 2026-11-09
status: APPROVED_ARCHITECTURE_BRIEF
standards:
  - "[[zero-hardcoded-variables]]"
  - "[[zero-hardcoded-sensitive-variables]]"
  - "Rule #1: Theme Immutability (src/style/themes/<nametheme>/theme.css)"
  - "Rule #2: Mobile Zero Horizontal Scroll (<=60 cols)"
  - "Rule #4: Privacy Default Masking Protocol"
---

# 🏗️ Master Architecture: Folder Structure, Config YAML, Branching & Routing

## 1. Overview & Architectural Principles

Arsitektur ini memisahkan secara ketat 3 zona kerja:
1. **Data Layer (`data/`)**: Seluruh konten mentah, skrip, aplikasi, kombo, dan aset visual didecoupling murni dari engine.
   - **Root `data/`**: Berisi file mentah pengembangan (*raw modular sources*).
   - **`public/data/`**: Berisi artefak terkompilasi mandiri (*compiled standalone exports* siap download).
2. **Engine Layer (`src/`)**: Frontend modular, engine UI, tema, layout view-mode reusable, dan komponen reaktif tanpa hardcoded data.
3. **Distribution Layer (`public/`)**: Hasil kompilasi static build siap deploy dengan Clean Directory Routing (`/apps/`, `/skills/`, `/combos/`, `/scripts/`).

---

## 2. Directory & File Topology Blueprint

```text
<repository_root>/
├── brief/                                 # Central Architecture & UI/UX Decisions
│   ├── v01-00_...md
│   ├── v01-04-02_uiux-catalog-arcade.md
│   └── v01-04-03_architecture-branch-folder-structure-and-external-push-tooling.md
│
├── data/                                  # Decoupled Raw Content Inputs (Development Sources)
│   ├── assets/                            # WebP thumbnails, preview images, icons
│   ├── apps/                              # Standalone Web Cartridges
│   │   ├── _catalog.json                  # Aggregated apps catalog
│   │   └── <title>/                       # e.g. radiansincostan/
│   │       ├── index.html                 # Standalone web app cartridge engine
│   │       ├── index_detailed.html        # Pre-baked detail & playground shell
│   │       ├── index.json                 # Metadata manifest (tokens, size, tags)
│   │       ├── GUIDE.html                 # User walkthrough & feature guide
│   │       └── README.html                # Technical specifications & architecture
│   ├── skills/                            # Modular Agent Directives
│   │   └── _catalog.json                  # Skills catalog dataset
│   ├── combos/                            # Meta-Skill Workflow Pipelines
│   │   └── _catalog.json                  # Combos catalog dataset
│   └── scripts/                           # Context Ops & CLI Automations
│       └── _catalog.json                  # Scripts catalog dataset
│
├── docs/                                  # Documentation generated/extracted from src
│
├── src/                                   # Frontend Engine Source
│   ├── modules/                           # Pure JavaScript Engine Modules
│   │   ├── build-bundle.js                # Core compilation & Omni-Catalog aggregator
│   │   ├── themeEngine.js                 # Theme Engine (Dark CRT / Light Retro Paper)
│   │   └── searchEngine.js                # Title search & omni-suggestion engine
│   │
│   ├── uiComponent/                       # Atomic UI elements (Modular & Reusable)
│   │   ├── cardDetailedItem.js / .html    # Inner content for detailed card (1:1)
│   │   ├── cardSimpleItem.js / .html      # Inner content for simple card (1:1 with Corner Badge)
│   │   ├── tableListRow.js / .html        # Table list row (pin -> title -> category -> size...)
│   │   └── accentPickerModal.js           # Accent color picker modal
│   │
│   ├── uiLayout/                          # Reusable View Shells & Layout Containers
│   │   ├── menu/                          # Master Hub Launcher layout shell (2x2 grid, 1:1, 70/30 btns)
│   │   ├── apps/                          # Master Subsystem Shell with CLI Breadcrumb & #suggestionBox
│   │   ├── cardview-simple/               # 3:4 simple compact grid container shell
│   │   │   └── layout.html
│   │   ├── tableview/                     # 60/72 cols tabular ledger container shell
│   │   │   └── layout.html
│   │   ├── playground/                    # Dual-Panel & Zen Focus playground layout shell
│   │   │   └── layout.html
│   │   ├── skill/                         # Skill detailed specification drawer shell
│   │   │   └── layout.html
│   │   ├── script/                        # Script detailed runner & parameters shell
│   │   │   └── layout.html
│   │   └── combo/                         # Combo workflow execution graph shell
│   │       └── layout.html
│   │
│   ├── modules/                           # Pure business logic, helpers & DOM engine (Flat)
│   │   ├── searchEngine.js                # Instant title substring match
│   │   ├── standaloneCompiler.js          # Inlining adapter helpers into _standalone
│   │   ├── telemetryCalculator.js         # Token, size, and LOC calculation
│   │   ├── preferencesStore.js            # LocalStorage demo profile & OS preset
│   │   ├── router.js                      # 4-tier URL parser (Default, =?standalone, =?playground, =?play)
│   │   ├── keyboardShortcuts.js           # ESC to close, ENTER to open, etc.
│   │   ├── clipboardToast.js              # 1-tap copy toast notification
│   │   └── drawerController.js            # Slide-over modal & terminal dock
│   │
│   └── style/                             # Theme Engine (Rule #1 Immutability)
│       └── themes/
│           ├── retro-crt-olive/           # Core Immutable Theme
│           │   └── theme.css
│           └── amber-terminal/            # Optional Alternate Theme
│               └── theme.css
│
├── public/                                # Compiled Static Distribution Output (Clean Directory URLs)
│   ├── index.html                         # domain.com/ (Master Hub / mainmenu)
│   ├── apps/
│   │   └── index.html                     # domain.com/apps/ (Arcade Catalog)
│   ├── skills/
│   │   └── index.html                     # domain.com/skills/ (Skill Directory Ledger)
│   ├── combos/
│   │   └── index.html                     # domain.com/combos/ (Pipelines Catalog)
│   ├── scripts/
│   │   └── index.html                     # domain.com/scripts/ (Context Ops Deck)
│   ├── main.js                            # Shared global script for all catalog pages
│   ├── theme.css                          # Compiled active theme stylesheet
│   ├── static/                            # Core engine assets (copied from src/static: fonts, favicon)
│   ├── assets/                            # Optimized content assets & WebP thumbnails
│   └── data/                              # COMPILED STANDALONE ARTIFACTS (Downloadable Exports)
│       ├── apps/                          # Per-App Artifact Bundles
│       │   └── <title>/                   # e.g. markdown-mindmap/
│       │       ├── index.html             # Standalone web app cartridge engine
│       │       ├── index_detailed.html    # Pre-baked detail & playground shell (Baked into one)
│       │       ├── index.json             # Metadata manifest (telemetry, tokens)
│       │       ├── GUIDE.html             # Standalone user guide
│       │       └── README.html            # Standalone technical readme
│       ├── skills/                        # Flat: <title>.md, <title>.json, <title>_detail.html
│       ├── combos/                        # Flat: <title>.md, <title>.json, <title>_detail.html
│       └── scripts/                       # Flat: <title>.<ext>, <title>.md, <title>.json, <title>_detail.html
│
├── build-config.yaml.example              # Template config (Default data/ paths & settings)
├── build-config.yaml                      # Active config (Customizable overrides, .gitignored)
├── build.json                             # Page manifest & asset hash registry
├── build.ps1                              # Master compilation & bundling pipeline
├── push-external.ps1                      # Automated deploy & push to external repo/branch
├── package.json                           # Tooling dependencies
└── package-lock.json
```

---

## 3. Branchless Tree Specification per Context (`asci-tree-codeblock-standard-without-branch`)

Struktur internal data untuk masing-masing ke-4 konteks menggunakan standar kode pohon tanpa cabang (*zero-branch*), indentasi 4 spasi murni, dan perataan kolom komentar `#` vertikal yang presisi:

### 3.1 Context: `apps` (The 5-File Cartridge Bundle)
```text
data
    apps                                    # Direktori sumber aplikasi web
        markdown-mindmap                    # Folder mandiri per cartridge aplikasi
            index.html                      # Engine aplikasi mandiri (single-file cartridge)
            index_detailed.html             # Pre-baked detail & playground shell (Baked into one)
            index.json                      # Manifest metadata (telemetry, tokens, tags)
            GUIDE.html                      # Halaman panduan penggunaan interaktif
            README.html                     # Halaman spesifikasi teknis dan lisensi
```

### 3.2 Context: `scripts` (Flat File Quartet per Script)
```text
data
    scripts                                 # Direktori kumpulan skrip otomasi (Flat)
        cd-repo.ps1                         # Skrip sumber otomasi (PowerShell/Python/Bash)
        cd-repo.md                          # Panduan dokumentasi dan contoh eksekusi
        cd-repo.json                        # Manifest metadata (telemetry, params, tokens)
        cd-repo_detail.html                 # Pre-baked detail view HTML terkompilasi
```

### 3.3 Context: `skills` (Flat File Triad per Skill)
```text
data
    skills                                  # Direktori kumpulan direktif agent (Flat)
        uiux-wireframe.md                   # Doktrin instruksi sistem prompt agent
        uiux-wireframe.json                 # Manifest metadata (trigger mode, tokens, tags)
        uiux-wireframe_detail.html          # Pre-baked detail view HTML terkompilasi
```

### 3.4 Context: `combo` (Flat File Triad per Combo)
```text
data
    combo                                   # Direktori kumpulan workflow pipeline (Flat)
        software-dev-os.md                  # Resep alur orkestrasi kerja multi-tahap
        software-dev-os.json                # Manifest metadata (stage list, deliverables)
        software-dev-os_detail.html         # Pre-baked detail view HTML terkompilasi
```

---

## 4. URL Routing Standard: Base Path & Action Suffix Scheme

Seluruh sub-sistem (`apps`, `skills`, `combos`, `scripts`) memanfaatkan **Client-Side Parameter Parsing** di dalam file `index.html` masing-masing tanpa men-generate ratusan file HTML fisik:

```text
[ 0. CATALOG OVERVIEW (DEFAULT) ]
  └── URL: domain.com/<context>/
           (Contoh: domain.com/apps/)
           -> Menampilkan katalog 3 mode tampilan (Detailed Card, Simple Card, Table List).

[ 1. DETAILED SPECIFICATION VIEW ]
  └── URL: domain.com/<context>/<title>
           (Contoh: domain.com/apps/markdown-mindmap)
           -> Membuka slide-over drawer berisi dokumentasi teknis, tabel parameter, dan metadata lengkap.

[ 2. STANDALONE ARTIFACT VIEW ]
  └── URL: domain.com/<context>/<title>=?standalone
           (Contoh: domain.com/apps/markdown-mindmap=?standalone)
           -> Menampilkan/mengunduh file mandiri bebas dependensi (_standalone.ps1, raw .html, atau checklist).

[ 3. PLAYGROUND VIEW (DUAL-PANEL) ]
  └── URL: domain.com/<context>/<title>=?playground
           (Contoh: domain.com/apps/markdown-mindmap=?playground)
           -> Meluncurkan Dual-Panel: Live sandbox preview di kiri + Code/Docs Inspector di kanan (fokus dev).
           -> Dilengkapi live toggle button [ 🎮 Zen Play ] yang langsung beralih ke =?play tanpa reload!

[ 4. ZEN PLAY VIEW (FULLSCREEN FOCUS DEMO) ]
  └── URL: domain.com/<context>/<title>=?play
           (Contoh: domain.com/apps/markdown-mindmap=?play)
           -> Menggunakan engine yang SAMA PERSIS dengan playground, namun 100% Fullscreen Zen Mode.
           -> Panel inspector disembunyikan. Dilengkapi floating toggle [ 🛠️ Inspector ] untuk beralih kembali ke =?playground!
```

### 4.1 Live Toggle Interaktif (`play <=> playground`)
Perpindahan antara mode **Playground** dan mode **Zen Play** bersifat dua arah dan reaktif secara instan:
- **Di Playground (`=?playground`)**: Terdapat tombol header `[ 🎮 Zen Play ]`. Saat diklik, panel inspector kanan langsung melipat (*collapse*), iframe melebar 100%, dan URL diperbarui ke `=?play` via `history.replaceState`.
- **Di Zen Play (`=?play`)**: Terdapat tombol melayang retro di pojok `[ 🛠️ Inspector ]`. Saat diklik, panel samping kembali terbuka ke mode split view (`=?playground`).

---

### 4.2 Model Input Data per Sub-Sistem

Perlakuan input data di `data/` dirancang spesifik sesuai karakteristik konten:

1. **Sub-sistem `skills` & `combos` (Flat File Triad: `<title>.md`, `<title>.json`, `<title>_detail.html`)**:
   - Disimpan secara flat langsung di dalam folder masing-masing tanpa subfolder bersarang.
   - `<title>.md`: Doktrin instruksi atau resep workflow pipeline.
   - `<title>.json`: Manifest metadata untuk rendering katalog.
   - `<title>_detail.html`: Pre-baked static HTML view hasil kompilasi.

2. **Sub-sistem `scripts` (Flat File Quartet: `<title>.<ext>`, `<title>.md`, `<title>.json`, `<title>_detail.html`)**:
   - Disimpan secara flat di `data/scripts/`:
     - `<title>.<ext>`: Skrip otomasi asli (PowerShell, Python, Bash).
     - `<title>.md`: Dokumentasi dan panduan eksekusi CLI.
     - `<title>.json`: Manifest metadata (parameter, LOC, tokens, OS target).
     - `<title>_detail.html`: Pre-baked static detail view hasil kompilasi.

3. **Sub-sistem `apps` (The 5-File Bundle: `index.html, index_detailed.html, index.json, GUIDE.html, README.html`)**:
   - Setiap web app di `data/apps/<title>/` memiliki 5 file mandiri:
     - **`index.html`**: Engine aplikasi mandiri (single-file cartridge yang berjalan di iframe).
     - **`index_detailed.html`**: Shell detail dan playground ter-bake menjadi satu (*baked into one*).
     - **`index.json`**: Manifest metadata (telemetry, tokens, tags, category).
     - **`GUIDE.html`**: Halaman panduan pengguna, fitur, shortcut keyboard, dan walkthrough.
     - **`README.html`**: Halaman spesifikasi teknis, arsitektur, dependencies, dan licensing.
   - **Inspector Panel Tabs di Playground Apps**:
     Di dalam playground `/apps/<title>=?playground`, panel samping kanan menyediakan tab navigasi langsung:
     `[ 📖 GUIDE.html ]` | `[ 📝 README.html ]` | `[ 💻 Source Code ]` | `[ ⬇ Download .html ]`!

---

### 4.3 Defensive Frontmatter Cascade & Missing-Data Fallback Protocol

Jika suatu artefak kehilangan salah satu atau seluruh field YAML frontmatter (atau bahkan tidak memiliki blok `---` sama sekali), sistem **tidak boleh crash**, kartu **tidak boleh bolong/rusak**, dan **tidak boleh memunculkan teks `none`**. Sistem menerapkan **3 Lapisan Pengaman (Defensive Cascade)**:

```text
1. Frontmatter YAML (.md)  ──[ Ada? ]──> Pakai nilai dari Frontmatter
           │ (Kosong / Hilang)
           ▼
2. Companion JSON (.json)  ──[ Ada? ]──> Pakai nilai dari .json
           │ (Kosong / Hilang)
           ▼
3. Auto-Inferred Defaults  ────────────> Hitung otomatis dari file fisik
```

#### Tabel Inferensi Otomatis (Auto-Inferred Fallback):
| Field Metadata | Perilaku Saat Hilang / Kosong | Algoritma Inferensi Default |
| :--- | :--- | :--- |
| **`title`** | Fallback otomatis | Diambil dari **Kebab-to-Title nama file** (`clean-git` $\rightarrow$ `Clean Git`) atau heading `# 1` pertama di markdown. |
| **`purpose`** | Fallback otomatis | Diambil dari **paragraf teks pertama** di file `.md` (auto-excerpt $\le 120$ karakter). Jika tidak ada teks sama sekali, slot ditiadakan secara fleksibel. |
| **`category`** | Fallback otomatis | Default ke **`general`** (maksimal 8 karakter sesuai batas budget tabel). |
| **`trigger`** | Fallback otomatis | Default ke **`🎯 On-Demand`** (asumsi paling aman; jangan pernah default ke `⚡ Always-On`). |
| **`size` / `loc`** | Auto-calculated | Dihitung **100% dari file fisik**: `fs.statSync().size` dan total hitungan baris file mentah. |
| **`tokens`** | Auto-estimated | Estimasi dinamis dari total karakter file: $\approx \text{chars} / 4$. |
| **`tags`** | Fallback otomatis | Diberi array kosong `[]` (bukan string `"none"`). Tag container tidak dirender di DOM. |
| **`preview` (16:9)**| Fallback otomatis | Menampilkan retro monospace ASCII placeholder berbingkai dengan judul artefak di tengah. |

#### Aturan Defensive UI Omission (Aturan *"No `| none`"*):
- Field yang bernilai kosong (`null`, `undefined`, atau `[]`) **langsung di-omit dari DOM**. Tidak boleh meninggalkan placeholder kosong, label `| none`, atau gap vertikal yang canggung.
- Tab navigasi di playground (`GUIDE`, `README`, `JSON`) hanya dirender jika file fisiknya benar-benar eksis. Jika `GUIDE.html` tidak ada, tab GUIDE otomatis di-omit.

#### Build-Time Diagnostics (Non-Blocking Linter):
Saat `./build.ps1` berjalan, parser mendeteksi field yang hilang dan mengeluarkan peringatan terstruktur di konsol tanpa menghentikan (*non-crashing*) proses build:
```text
[BUILD:SCAN] Parsing 92 skills in data/skills/ ...
[WARN] data/skills/git-auto-tag.md: Missing 'purpose' frontmatter!
       -> Inferred fallback from first paragraph.
[WARN] data/skills/quick-lint.md: Missing 'category' frontmatter!
       -> Inferred fallback: "general"
[OK] 92 skills compiled successfully into public/skills/index.html
```

---

### 4.4 Logika Eksekusi di `modules/router.js`:
```javascript
// Path format: /apps/markdown-mindmap=?playground
const fullPath = window.location.pathname.replace(/^\//, ''); // 'apps/markdown-mindmap=?playground'
const [baseRoute, mode] = fullPath.split('=?');
const [context, title] = baseRoute.split('/');

if (!title) {
  renderCatalogOverview(context);
} else if (mode === 'play') {
  renderZenFocusMode(context, title);        // 100% Fullscreen Zen Mode (Toggleable ke playground)
} else if (mode === 'playground') {
  renderDualPanelPlayground(context, title); // Dual-Panel Preview + Triad Tabs (Toggleable ke play)
} else if (mode === 'standalone') {
  renderStandaloneView(context, title);      // Standalone Export / Direct Code
} else {
  openDetailedSpecDrawer(context, title);    // Default: Detailed Spec Drawer
}
```

---

## 5. Spesifikasi `build-config.yaml.example`

```yaml
# ==============================================================================
# build-config.yaml.example - Master Build Configuration Template
# Salin file ini menjadi build-config.yaml untuk konfigurasi aktif lokal.
# JANGAN PERNAH COMMIT build-config.yaml jika berisi kredensial sensitif.
# ==============================================================================

app:
  name: "Retro IT Knowledge Arcade"
  version: "1.0.0"
  theme_default: "retro-crt-olive"   # Dipilih dari src/style/themes/

# ------------------------------------------------------------------------------
# DATA SOURCE PATHS (DEFAULT: Pointing directly to root data/*)
# Anda bisa mengubah (override) path di bawah ini ke direktori lain jika diperlukan.
# Seluruh path wajib relatif terhadap workspace root (Rule #3).
# ------------------------------------------------------------------------------
sources:
  assets:  "./data/assets"           # WebP thumbnails, preview snapshots, icons
  apps:    "./data/apps"             # Standalone HTML cartridges
  docs:    "./data/docs"             # Markdown docs & guides
  scripts: "./data/scripts"          # Modular script source (.ps1, .py, .sh)
  combos:  "./data/combo"            # Meta-skill workflow pipeline recipes

# ------------------------------------------------------------------------------
# COMPILATION & STANDALONE SETTINGS
# ------------------------------------------------------------------------------
compiler:
  standalone_suffix: "_standalone"   # Suffix output kompilasi (misal: script_standalone.ps1)
  inline_adapters: true              # Otomatis inline helper modul lokal
  minify_html: false                 # Pertahankan keterbacaan kode retro
  generate_sourcemaps: false

# ------------------------------------------------------------------------------
# PRIVACY & SANITIZATION (RULE #4)
# ------------------------------------------------------------------------------
privacy:
  mask_default_state: true           # Tampilkan data sensitif dengan sensor 2-huruf
  allowed_domains_whitelist:
    - "github.com"
    - "raw.githubusercontent.com"
    - "users.noreply.github.com"

# ------------------------------------------------------------------------------
# EXTERNAL DEPLOYMENT SETTINGS
# ------------------------------------------------------------------------------
deployment:
  output_dir: "./public"             # Direktori output static build
  target_remote: "origin"            # Git remote target
  target_branch: "gh-pages"          # Branch tujuan untuk deploy publik
  cname: ""                          # Domain kustom (opsional, biarkan kosong jika pakai github.io)
  base_url: "./"                     # Base URL root-bounded relative
```

---

## 6. Git Branch Topology & External Deployment

Arsitektur branch memisahkan source code pengembangan dan hasil distribusi publik secara mutlak:

```text
[ LOCAL WORKSPACE ]
       │
       ├── branch: main (atau dev)
       │     └── Berisi source code lengkap: src/, data/, brief/, build.ps1
       │
       ▼ [ Running: ./build.ps1 -ExportStatic ]
[ GENERATED OUTPUT ]
       │
       └── folder: public/ (Zero-Backend Static Artifacts dengan Clean URLs)
              │
              ▼ [ Running: ./push-external.ps1 ]
[ EXTERNAL / GITHUB REMOTE ]
       │
       └── branch: gh-pages (atau distribution-only repository)
             └── Hanya memuat isi folder public/ tanpa history internal!
```

---

## 7. Tooling Otomasi: Build & Push External

### 7.1 Pipeline Kompilasi (`build.ps1`)
1. **Load Config**: Membaca `build-config.yaml` (fallback ke `build-config.yaml.example`).
2. **Resolve Sources**: Memetakan path `sources.assets`, `sources.apps`, `sources.docs`, `sources.scripts`, `sources.combos`.
3. **Compile Standalone**: Mengompilasi script modular di root `data/scripts/` menjadi varian `*_standalone.ps1` ke folder `public/data/scripts/`, serta mengekspor artefak mandiri ke `public/data/{apps,skills,combos}/`.
4. **Aggregate Catalog**: Menghitung ukuran file, LOC, estimasi AI token, dan menyusun index ke `build.json`.
5. **Compose Layouts (`src/uiLayout/`)**:
   - Merakit halaman dengan menggabungkan `uiLayout/navigation-panel`, `uiLayout/hero`, dan kontainer mode aktif (`cardview-detailed`, `cardview-simple`, atau `tableview`).
   - Menyediakan wadah detail dan interaktif dari `uiLayout/{playground, skill, script, combo}` untuk melayani 4-tier routing (`title`, `title=?standalone`, `title=?playground`, `title=?play`).
   - Menyuntikkan item atomik dari `src/uiComponent/` ke dalam layout.
6. **Export Pages**:
   - `public/index.html` (Master launcher)
   - `public/apps/index.html`
   - `public/skills/index.html`
   - `public/combos/index.html`
   - `public/scripts/index.html`
   - Menghasilkan shared bundle `main.js` untuk seluruh halaman katalog.

### 7.2 Tool Push ke Remote Eksternal (`push-external.ps1`)
1. **Sanitizer Check (Pre-flight)**: Memastikan zero credential leak dan zero machine absolute paths.
2. **Isolated Clean Push**: Memanfaatkan `git subtree push --prefix public <remote> <branch>` atau temporary orphan branch agar branch `gh-pages` hanya menerima file bersih di dalam `public/`.
3. **Automated Verification**: Verifikasi integrity file hash.

---

## 8. Evaluasi Arsitektur (WDYT)
- **Universal Suffix `=?<action>`**: Pola `domain.com/<context>/<title>=?<action>` sangat jelas, intuitif, dan berlaku seragam di seluruh 4 konteks tanpa ambiguitas.
- **Single Page Controller**: Cukup 1 file `index.html` di tiap direktori untuk meng-handle katalog, drawer detail, dual-panel playground, maupun zen fullscreen demo.
- **Directory Clean URLs**: Pengunjung mendapatkan URL bersih (`domain.com/apps/`, `domain.com/skills/`) yang profesional dan langsung dimengerti server statis.
- **100% Zero Code Yet**: Tetap mematuhi instruksi, hanya mendokumentasikan spesifikasi di dokumen brief.
