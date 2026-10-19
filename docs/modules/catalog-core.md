---
title: Client-Side Catalog Core Engine
module: catalog-core.js
path: src/modules/catalog-core.js
target: page-apps.js
status: active
version: 2.1.0
---

# 📚 `catalog-core.js` — Client-Side Catalog Engine

Client-Side Rendering (CSR) catalog manager that loads, filters, sorts, and renders software cartridges.

---

## 1. Overview & Architecture

* **Data Source**: Fetches `apps/_catalog.json` asynchronously on page load.
* **Filter Dimensions**:
  - **Sector**: `edu`, `fnb`, `tools`, `games`.
  - **Search Query**: Real-time matching against title, description, and tags.
  - **View Mode**: Desktop Detail View (`detail-view`) vs Mobile Grid View (`grid-view`).
* **Pinning System**: Persists pinned slugs in `localStorage['arcade_pins']`.

---

## 2. Exported / Internal Functions

* `initCatalog()`: Primary lifecycle bootstrapper.
* `renderCards(apps)`: Transforms array of cartridge metadata into DOM nodes with 45° cornercuts.
* `filterCatalog(query, sector)`: Multi-factor filter returning subset of matching apps.
* `togglePin(slug)`: Adds or removes slug from pinned list and triggers re-render.
