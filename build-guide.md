# 🕹️ Build Runner Guide (`build.ps1`)

Panduan komprehensif untuk menjalankan, mengonfigurasi, dan mengotomasi pipeline kompilasi standalone **Retro Template Catalog Website** menggunakan script [build.ps1](file:///d:/0pro/fadhlisl-my-id/build.ps1).

---

## 📑 Daftar Isi

- [1. Ringkasan Eksekutif](#1-ringkasan-eksekutif)
- [2. Alur Eksekusi 4 Tahap (1.2.3.4)](#2-alur-eksekusi-4-tahap-1234)
- [3. Parameter & Flag CLI](#3-parameter--flag-cli)
- [4. Contoh Skenario Penggunaan (Examples)](#4-contoh-skenario-penggunaan-examples)
  - [Contoh A: Default Quick Run (Tekan ENTER)](#contoh-a-default-quick-run-tekan-enter)
  - [Contoh B: Memilih Folder Cartridge Custom](#contoh-b-memilih-folder-cartridge-custom)
  - [Contoh C: Mode Otomatis (CI / Non-Interactive)](#contoh-c-mode-otomatis-ci--non-interactive)
  - [Contoh D: Otomatis Menjalankan Local Preview Server](#contoh-d-otomatis-menjalankan-local-preview-server)
- [5. Struktur Output Hasil Build (`public/`)](#5-struktur-output-hasil-build-public)
- [6. Troubleshooting & FAQ](#6-troubleshooting--faq)

---

## 1. Ringkasan Eksekutif

[build.ps1](file:///d:/0pro/fadhlisl-my-id/build.ps1) adalah interactive runner PowerShell yang dirancang agar siapapun yang men-clone atau mem-fork repositori ini dapat mengompilasi seluruh web catalog tanpa perlu menghafal perintah CLI yang rumit.

Script ini:
- **Zero-Baggage**: Hanya memasang modul yang benar-benar dibutuhkan (`playwright` untuk auto-screenshot desktop preview).
- **Fleksibel**: Mengizinkan pengguna menentukan dari mana folder apps/cartridge berasal.
- **Airgap CSR**: Menghasilkan distribusi murni static client-side di folder `public/`.

---

## 2. Alur Eksekusi 5 Tahap (1.2.3.4.5)

Saat kamu menjalankan `.\build.ps1`, script akan mengeksekusi tahapan terstruktur berikut:

```text
======================================================================
  🕹️  RETRO TEMPLATE CATALOG WEBSITE -- BUILD RUNNER
======================================================================
[1/5] Checking Node.js runtime...
[2/5] Checking required dependencies... (Playwright only)
[3/5] Checking Engine Configuration (build-config.yaml)...
[4/5] Resolving Cartridge Directory (apps/)...
[5/5] Executing compiler engine (src/modules/build-bundle.js)...
======================================================================
  ✨ BUILD COMPLETE! Compiled distribution ready in ./public
======================================================================
```

### 1️⃣ Tahap 1: Verifikasi Runtime Node.js
- Memeriksa apakah `node` tersedia di PATH sistem.
- Membutuhkan minimal **Node.js v18+**.
- Menampilkan versi aktif di konsol (misal: `v20.18.0`).

### 2️⃣ Tahap 2: Pengecekan Modul Esensial (Playwright Only)
- Memeriksa apakah folder `node_modules/playwright` sudah terpasang.
- Jika belum ada, script secara otomatis menjalankan `npm install`.
- Karena [package.json](file:///d:/0pro/fadhlisl-my-id/package.json) hanya berisi `playwright`, maka hanya package tersebut yang dipasang tanpa bloatware tambahan.

### 3️⃣ Tahap 3: Pengecekan & Guided Setup Konfigurasi (`build-config.yaml`)
- Script mendeteksi apakah `build-config.yaml` belum ada, atau masih berisi nilai placeholder template (seperti `YOUR-URL-DOMAIN.COM HERE`).
- Jika terdeteksi belum dikonfigurasi, pengguna diberikan pilihan:
  - **[1] Guided Setup**: Menjawab pertanyaan interaktif satu per satu (Project Title, Domain URL, GitHub Repo, Author, Accent Color, TTS).
  - **[2] Edit manually**: Otomatis membuka `build-config.yaml` di text editor (VS Code / Notepad).
  - **[3] Keep current**: Melanjutkan build menggunakan konfigurasi saat ini.

### 4️⃣ Tahap 4: Pemilihan Lokasi Folder Cartridge (`apps/`)
- Menanyakan kepada pengguna: *"Where are your cartridge apps located?"*.
- Default: `./apps` (bisa langsung menekan tombol **ENTER**).
- Menerima path relatif maupun absolute (misal: `../koleksi-game` atau `D:\pro\apps`).
- Jika folder belum ada, script otomatis membuatkannya.

### 5️⃣ Tahap 5: Kompilasi & Kompaksi Standalone
- Menjalankan core compiler engine [src/modules/build-bundle.js](file:///d:/0pro/fadhlisl-my-id/src/modules/build-bundle.js) dengan flag `--apps=<folder>`.
- Menghasilkan 3 bundle JS client, menggabungkan stylesheet, dan menyinkronkan catalog `_catalog.json`.
- Menampilkan opsi membuka preview server lokal (`http://localhost:8080`).

---

## 3. Parameter & Flag CLI

Untuk penggunaan tingkat lanjut atau otomasi script, [build.ps1](file:///d:/0pro/fadhlisl-my-id/build.ps1) mendukung parameter berikut:

| Parameter | Tipe | Default | Deskripsi |
| :--- | :---: | :---: | :--- |
| `-AppsDir <path>` | String | `"apps"` | Menentukan folder cartridge secara langsung tanpa prompt interaktif. |
| `-NoPrompt` | Switch | `$false` | Menonaktifkan semua pertanyaan interaktif (cocok untuk CI/CD atau script otomatis). |
| `-Serve` | Switch | `$false` | Otomatis menjalankan preview server web lokal di port 8080 setelah build selesai. |

---

## 4. Contoh Skenario Penggunaan (Examples)

### Contoh A: Default Quick Run (Tekan ENTER)
Ini adalah alur paling umum untuk penggunaan sehari-hari:

```powershell
PS D:\0pro\fadhlisl-my-id> .\build.ps1

======================================================================
  🕹️  RETRO TEMPLATE CATALOG WEBSITE -- BUILD RUNNER
======================================================================
Directory : D:\0pro\fadhlisl-my-id

[1/4] Checking Node.js runtime... [OK] (v20.18.0)
[2/4] Checking required dependencies... [OK] (Playwright ready)
[3/4] Resolving Cartridge Directory (apps/)...
      Where are your cartridge apps located?
      [Default: apps (Press ENTER) or enter custom path]: 
      -> Target Apps Directory: D:\0pro\fadhlisl-my-id\apps

[4/4] Executing compiler engine (src/modules/build-bundle.js)...
----------------------------------------------------------------------
  -> Processed cartridge: radiansincostan (MATH & CANVAS)
  ★ Generated public/apps/_catalog.json (1 apps compiled)
  -> Compiling 3 Client JS Bundles...
  -> Bundling & Copying Stylesheets...
  -> Compiling HTML Shells...

======================================================================
  ✨ BUILD COMPLETE! Compiled distribution ready in ./public
======================================================================
  Live Output : D:\0pro\fadhlisl-my-id\public\index.html
  Apps Catalog: D:\0pro\fadhlisl-my-id\public\page-apps.html
  Playground  : D:\0pro\fadhlisl-my-id\public\page-playground.html

Start local preview server now? (y/N): n
```

---

### Contoh B: Memilih Folder Cartridge Custom
Jika kamu memiliki folder cartridge di lokasi terpisah (misalnya di luar repo):

```powershell
PS D:\0pro\fadhlisl-my-id> .\build.ps1

[3/4] Resolving Cartridge Directory (apps/)...
      Where are your cartridge apps located?
      [Default: apps (Press ENTER) or enter custom path]: D:\my-cartridges\retro-games
      -> Target Apps Directory: D:\my-cartridges\retro-games
```
> Compiler akan langsung membaca semua file `index.md`, `index.html`, dan thumbnail WebP dari direktori tersebut dan mengompilasinya ke `public/apps/`!

---

### Contoh C: Mode Otomatis (CI / Non-Interactive)
Cocok dipanggil dari skrip otomasi atau GitHub Actions:

```powershell
# Jalankan build langsung menggunakan folder default apps tanpa jeda input
.\build.ps1 -NoPrompt
```

Atau tentukan folder spesifik:
```powershell
.\build.ps1 -AppsDir "my-experiments" -NoPrompt
```

---

### Contoh D: Otomatis Menjalankan Local Preview Server
Langsung menyalakan server lokal setelah selesai kompilasi:

```powershell
.\build.ps1 -Serve -NoPrompt
```
Output:
```text
Starting local preview server on http://localhost:8080 ...
   ┌───────────────────────────────────────────────┐
   │                                               │
   │   Serving!                                    │
   │                                               │
   │   - Local:            http://localhost:8080   │
   │   - On Your Network:  http://192.168.1.5:8080 │
   │                                               │
   └───────────────────────────────────────────────┘
```

---

## 5. Struktur Output Hasil Build (`public/`)

Setelah `build.ps1` selesai, folder `public/` berisi distribusi final siap saji (*airgap CSR*):

```text
public/
├── index.html                  # Instant redirect shell menuju page-apps.html
├── page-apps.html              # Shell katalog utama (Floppy Disk Grid)
├── page-playground.html        # Shell Bento Sandbox 60/40 & Slidev viewer
├── winget.html                 # Shell terminal popup navigasi cepat
├── page-apps.js                # Bundle runtime katalog (10 modul terkompaksi)
├── page-playground.js          # Bundle runtime playground & speech engine
├── winget.js                   # Standalone quick nav modal controller
├── theme.css                   # Master retro theme (Rule #1: 100% byte fidelity)
├── style.css                   # Gabungan styling retro cornercut & modals
├── terminal.css                # Efek scanline & blinking CRT cursor
├── winget.css                  # Scoped styling untuk winget quick nav
└── apps/                       # Cartridge distribusi
    ├── _catalog.json           # Catalog metadata terindeks
    └── <slug>/                 # Folder per-cartridge
        ├── index.html          # Standalone app cartridge
        ├── index_catalog.json  # Metadata individual
        ├── index_playground.html # Standalone bento CSR view
        └── img*.webp           # Thumbnail WebP adaptif
```

---

## 6. Troubleshooting & FAQ

### Q1: Muncul error `File cannot be loaded because running scripts is disabled on this system`?
**Solusi**: Ini adalah policy default Windows PowerShell. Jalankan perintah ini sekali di jendela terminal kamu untuk mengizinkan eksekusi script lokal:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\build.ps1
```

### Q2: Apakah saya harus menjalankan `npm install` manual terlebih dahulu?
**Jawaban**: **Tidak perlu.** [build.ps1](file:///d:/0pro/fadhlisl-my-id/build.ps1) akan otomatis mengecek keberadaan `node_modules` pada Tahap 2 dan memasang Playwright secara otomatis jika belum ada.

### Q3: Bagaimana cara deploy ke GitHub Pages?
**Jawaban**: Repositori ini sudah dilengkapi alur otomatis [.github/workflows/deploy.yml](file:///d:/0pro/fadhlisl-my-id/.github/workflows/deploy.yml). Saat kamu melakukan push ke GitHub, workflow akan otomatis menjalankan proses build dan mempublikasikan folder `public/` ke GitHub Pages secara gratis!
