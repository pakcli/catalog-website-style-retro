---
title: Home Menu 2x2 Grid Layout & Big Text Subsystem Cards Specification
version: v01-02-02
date: 2026-11-09
status: CANONICAL_DESIGN_BRIEF
standards:
  - "[[zero-hardcoded-variables]]"
  - "[[donot-overengineer-instructions]]"
  - "Rule #1: Theme Immutability (src/style/themes/<nametheme>/theme.css)"
  - "Rule #2: Mobile Zero Horizontal Scroll (<=60 cols)"
  - "Rule #6: Zero Rocket Emoji Invariant (Strictly Ban 🚀, use pure ASCII >_ or clean text)"
  - "Golden Invariant: Card Aspect Ratio 3:4"
  - "Golden Invariant: Media Slot Aspect Ratio 16:9"
---

# 🖥️ Home Menu 2x2 Grid & Big Text Subsystem Cards Specification (`v01-02-02`)

## 1. Overview & Minimalist Philosophy

Sesuai arahan efisiensi tanpa overengineering (*`donot-overengineer-instructions`*), halaman utama **Home Hub (`public/index.html`)** menggunakan pendekatan retro terminal paling murni dengan kartu bujur sangkar **1:1** berisi **3 baris struktur**:

1. **Zero External Art Bloat**: Tidak menggunakan file gambar eksternal yang lambat dimuat, tidak menggunakan SVG bertingkat yang rumit, dan tidak ada elemen berlebih.
2. **Container 1:1 Bujur Sangkar**: Mengikuti proporsi fisik disket 3.5" asli ($90\text{ mm} \times 94\text{ mm}$), seluruh kartu home hub, mode detailed, dan mode simple menggunakan rasio bujur sangkar **1:1** (`aspect-ratio: 1 / 1`).
3. **Struktur 3 Baris Baku**:
   - **Row 1**: Big Text Box dengan nomor badge di pojok kiri atas (`[1] apps`, `[2] skills`, `[3] combo`, `[4] script`). Tanpa category badge terpisah (`floppy-cat-badge` dihapus).
   - **Row 2**: Quick Description (2 baris teks deskripsi modul yang bersih dan terpusat).
   - **Row 3**: Tombol Aksi terbagi 70/30: **`Open`** (70%, accent) dan **`Share`** (30%, tactile bevel link) dengan feedback toast `[ 📋 Link copied ]`.
4. **Theme Dynamic**: Teks besar di baris 1 dan tombol `Open` di baris 3 mewarisi warna `--interactive-accent` secara reaktif.

---

## 2. Grid & Card Proportions Specification (Zero Vertical Scroll Lock)

> [!IMPORTANT]
> **Home Menu Viewport Lock (Rule #2)**:
> Halaman utama `/` (`body[data-page="home"]`) **DILARANG KERAS memiliki vertical scrollbar** (`overflow: hidden; 100vh / 100dvh`).
> Seluruh elemen (Hero Header, Sticky Navbar, 2x2 Grid) wajib muat dalam satu layar penuh.
> Ukuran kartu 1:1 menyesuaikan tinggi viewport yang tersedia secara otomatis.

| Komponen | Spesifikasi Baku | Aturan CSS / Layout |
| :--- | :--- | :--- |
| **Grid Container** | 2x2 Grid (1:1 Overall Ratio) | `grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; aspect-ratio: 1 / 1; height: 100%; width: auto; max-width: 100%; margin: 0 auto;` |
| **Card Aspect Ratio** | Square 1:1 Wajib | `width: 100%; height: 100%; max-width: 100%; max-height: 100%; aspect-ratio: 1 / 1;` (auto-scaling dari tinggi baris grid). |
| **Cardview-Simple** | Square 1:1 Wajib | `.app-cards-grid.view-simple .floppy-card { aspect-ratio: 1 / 1; }` (compact square browsing, category badge top-left, pin top-right). |
| **Row 1 (Media Slot)** | Screen Box w/ Corner Num | `flex: 1 1 0; width: 100%; position: relative;` |
| **Corner Badge** | Monospace Number Top-Left | `[1]`, `[2]`, `[3]`, `[4]` (`position: absolute; top: 6px; left: 8px;`) |
| **Center Big Text** | Monospace Bold Dynamic | `font-family: var(--font-monospace); font-size: clamp(22px, 4.5vh, 40px); font-weight: 800; color: var(--interactive-accent); text-align: center;` |
| **Row 2 (Quick Desc)** | 2-Line Clamped Monospace | `font-size: clamp(9px, 1.2vh, 11px); line-height: 1.3; text-align: center;` |
| **Row 3 (CTA & Share)** | Tombol Bevel 70/30 | `grid-template-columns: 7fr 3fr;` (`.btn-open` 70% accent + `.btn-share` 30% retro bevel). |
| **Vertical Scroll** | ZERO Vertical Scroll | `body[data-page="home"] { overflow: hidden; height: 100dvh; }` (Obsidian leaf isolation, zero `!important`). |

---

## 3. ASCII Wireframe: Master Home Menu Hub

```text
+======================================================================+
| [ HERO 3.5" FLOPPY DISKETTE WITH 45° CORNER CUT ]                    |
| >_ RETRO IT KNOWLEDGE ARCADE                                         |
| Decoupled knowledge OS & standalone web cartridges                   |
| [ SUBSYSTEMS: 4 Modules ] [ TIME: WIB ] [ ACCENT: #B0A84A ] [ GITHUB ]|
+======================================================================+
| home > [ Type title to filter... ]                [⛶] [🔍] [☀️ Mode] |
| Press [1] Apps | [2] Skills | [3] Combos | [4] Scripts               |
+======================================================================+
|                                                                      |
|  ┌──────────────────────────────┐    ┌──────────────────────────────┐  |
|  │ [1]                          │    │ [2]                          │  |
|  │                              │    │                              │  |
|  │            apps              │    │            skills            │  |
|  │       (BIG TEXT ALONE)       │    │       (BIG TEXT ALONE)       │  |
|  ├──────────────────────────────┤    ├──────────────────────────────┤  |
|  │ Single-file web cartridges,  │    │ Standardized prompt rules,   │  |
|  │ canvas tools & decks.        │    │ AI behaviors & directives.   │  |
|  ├──────────────────────────────┤    ├──────────────────────────────┤  |
|  │ [           Open           ] │    │ [           Open           ] │  |
|  └──────────────────────────────┘    └──────────────────────────────┘  |
|                                                                      |
|  ┌──────────────────────────────┐    ┌──────────────────────────────┐  |
|  │ [3]                          │    │ [4]                          │  |
|  │                              │    │                              │  |
|  │            combo             │    │            script            │  |
|  │       (BIG TEXT ALONE)       │    │       (BIG TEXT ALONE)       │  |
|  ├──────────────────────────────┤    ├──────────────────────────────┤  |
|  │ Multi-stage orchestration    │    │ Automation tools with        │  |
|  │ pipelines & review gates.    │    │ standalone script export.    │  |
|  ├──────────────────────────────┤    ├──────────────────────────────┤  |
|  │ [           Open           ] │    │ [           Open           ] │  |
|  └──────────────────────────────┘    └──────────────────────────────┘  |
|                                                                      |
+======================================================================+
```

---

## 4. Sub-Catalog Cards: Mode 1 & Mode 2 (Ratio 3:4)

Pada halaman sub-sistem katalog (`/apps/`, `/skills/`, `/combos/`, `/scripts/`), kartu item menggunakan rasio **3:4** yang sama dengan 2 varian tampilan:

### 4.1 Mode 1: Card Detailed (3:4 Ratio)
1. **Row 1**: Category Badge (kiri) + PIN Button (kanan).
2. **Row 2**: Slot Media 16:9 (Menampilkan tangkapan layar WebP aplikasi / preview spesifikasi).
3. **Row 3**: Title terlebih dahulu, baru Purpose di bawahnya (*title baru purpose*).
4. **Row 4**: Telemetry bar (`FileSize │ LOC │ Tokens │ Tags`).
5. **Row 5**: Tombol aksi utama `[ >_ Open in Playground ]` + sub-grid dual aksi `[ ⬇ Download ]` dan `[ Standalone ↗ ]`.

### 4.2 Mode 2: Card Simple (3:4 Ratio)
1. **Row 1**: Telemetry badges (`FileSize │ LOC │ Tokens`) bersanding langsung dengan PIN Button.
2. **Row 2**: Slot Media 16:9 Compact.
3. **Row 3**: Title terlebih dahulu, baru Purpose di bawahnya.
4. **Row 4**: Tombol aksi utama `[ >_ Open in Playground ]` + tombol download lebar `[ ⬇ Download ]` berdampingan dengan icon panah `[ ↗ ]`.

---

## 5. Implementasi DOM untuk Home Hub Media Slot

```html
<!-- Contoh slot media 16:9 dengan Big Text Center Alone -->
<div class="media-slot-16-9">
  <div class="screen-preview-slot">
    <div class="hub-center-big-text">apps</div>
  </div>
</div>
```

```css
/* Styling bersih tanpa overhead */
.hub-center-big-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-monospace, monospace);
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  color: var(--interactive-accent);
  text-transform: lowercase;
  letter-spacing: 0.08em;
  user-select: none;
}
```

---

## 6. Review Gate (`donot-code-yet`)

Dokumen spesifikasi ini berstatus **CANONICAL_DESIGN_BRIEF**. Implementasi kode untuk layout 2x2 grid, rasio 3:4, dan Big Text Center Alone pada Home Menu akan dieksekusi setelah konfirmasi pengguna.
